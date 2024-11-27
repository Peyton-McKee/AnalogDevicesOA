use std::{
    collections::VecDeque,
    sync::{
        atomic::{AtomicUsize, Ordering},
        Arc,
    },
    time::{Duration, SystemTime},
};

use diesel::{query_dsl::methods::FindDsl, ExpressionMethods, RunQueryDsl};
use tokio::{
    sync::{
        mpsc::{self, Receiver, Sender},
        Mutex, Notify,
    },
    task::JoinHandle,
    time::sleep,
};

use crate::{
    diesel::{
        models::{Message, Producer},
        schema::{
            messages::{dsl::*, failed, sent, time_took},
            producers::{dsl::*, status},
        },
    },
    utils::{
        error::SMSManagerError,
        random_utils::{get_random_wait_time, random_chance},
    },
    PoolHandle,
};

/// Chatgpt helped me with the general architecture of this setup
/// Multi Producer Single Consumer architecuture for sending out many messages as individual threads, but only updating the database with one to not take up too many databse connnections
/// # Parameters
/// - queue: The queue of messages to consume
/// - pool: The database pool to retrieve a datbase connection from
/// - producer: The producer the messages are generated from
/// - num_threads: The number of threads used to consume the queue
pub async fn send_messages(
    queue: Arc<Mutex<VecDeque<Message>>>,
    pool: Arc<PoolHandle>,
    producer: &Producer,
    num_threads: i32,
) {
    let mut handles: Vec<JoinHandle<()>> = vec![];
    let (tx, rx) = mpsc::channel::<Message>(100);
    let active_threads = Arc::new(AtomicUsize::new(num_threads.try_into().unwrap())); // Verified it is positive integer earlier
    let notify: Arc<Notify> = Arc::new(Notify::new());

    handles.extend(get_senders(
        queue,
        producer,
        &tx,
        active_threads,
        &notify,
        num_threads,
    ));

    handles.push(get_message_updater(rx, pool));

    notify.notified().await;

    drop(tx);

    for handle in handles {
        handle.await.unwrap();
    }
}

/// Consumes the queued messages by instantiating the given number of threads. As each message is processed, it adds the updated message to the sender
///
/// # Parameters
/// - queue: The queue of messages to consume
/// - producer: The producer the messages are generated from
/// - tx: The sender of the updated messages once processed
/// - active_threads: The active threads used to be notified of completion
/// - notify: Notifier that is called once the thread has completed consuming the queue
/// - num_threads: The number of threads to create
///
/// # Returns
/// The handles of the created threads
pub fn get_senders(
    queue: Arc<Mutex<VecDeque<Message>>>,
    producer: &Producer,
    tx: &Sender<Message>,
    active_threads: Arc<AtomicUsize>,
    notify: &Arc<Notify>,
    num_threads: i32,
) -> Vec<JoinHandle<()>> {
    let mut handles = vec![];

    // Spawn the threads and process the queue
    for _ in 0..num_threads {
        let queue = Arc::clone(&queue);
        let producer = producer.clone();
        let tx = tx.clone(); // Clone the sender for each thread
        let active_threads = Arc::clone(&active_threads);
        let notify = Arc::clone(notify);

        let handle = tokio::spawn(async move {
            while let Some(item) = {
                let mut q = queue.lock().await;
                q.pop_front()
            } {
                println!("Processing item: {}", item.id);

                let begin_time = SystemTime::now();

                let wait_time = get_random_wait_time(&producer.average_send_delay);

                // Non-blocking async sleep
                sleep(Duration::from_secs(wait_time)).await;

                let time = SystemTime::now()
                    .duration_since(begin_time)
                    .unwrap()
                    .as_secs() as i32;

                let did_fail = random_chance(producer.failure_rate);

                let updated_message = Message {
                    id: item.id,
                    sent: true,
                    time_took: Some(time),
                    failed: did_fail,
                    message_body: item.message_body,
                    produced_by: item.produced_by,
                };

                if tx.send(updated_message).await.is_err() {
                    eprintln!("Failed to send message to the updater queue.");
                }
            }

            if active_threads.fetch_sub(1, Ordering::SeqCst) == 1 {
                notify.notify_one();
            }
        });

        handles.push(handle);
    }

    handles
}

/// Reads messages from the receiver and updates the database with the updated messages
///
/// # Paramters
/// - rx: The receiver that will be used to receive incoming updated messages
/// - pool: The database pool to retrieve a datbase connection from
pub fn get_message_updater(mut rx: Receiver<Message>, pool: Arc<PoolHandle>) -> JoinHandle<()> {
    tokio::spawn(async move {
        let mut db = pool.get().unwrap();
        while let Some(message) = rx.recv().await {
            // Update the message in the database
            match diesel::update(messages.find(message.id))
                .set((
                    sent.eq(message.sent),
                    time_took.eq(message.time_took),
                    failed.eq(message.failed),
                ))
                .execute(&mut db)
            {
                Ok(_) => println!("Updated message {} in the database.", message.id),
                Err(err) => eprintln!("Failed to update message {}: {}", message.id, err),
            }

            let _ = diesel::update(producers.find(message.produced_by))
                .set(status.eq("SENDING"))
                .execute(&mut db)
                .map_err(SMSManagerError::DbError);
        }

        println!("Database updater thread finished. Queue is empty.");
    })
}
