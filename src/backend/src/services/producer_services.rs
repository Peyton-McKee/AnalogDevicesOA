use std::sync::atomic::{AtomicUsize, Ordering};
use std::{collections::VecDeque, sync::Arc, time::SystemTime};

use tokio::sync::{mpsc, Mutex, Notify};
use tokio::time::{sleep, Duration};

use diesel::{
    dsl::insert_into,
    query_dsl::methods::{FilterDsl, FindDsl},
    BoolExpressionMethods, ExpressionMethods, RunQueryDsl,
};

use crate::{
    diesel::{
        models::{Message, NewProducer, Producer},
        schema::{
            messages::{dsl::messages, failed, produced_by, sent, time_took},
            producers::dsl::*,
        },
    },
    transformers::producer_transformer::ProgressData,
    utils::{
        error::SMSManagerError,
        message_creator::create_message,
        random_utils::{get_random_wait_time, random_chance},
        uuid::parse_uuid,
    },
    Database, PoolHandle,
};

/**
 *
 */
pub async fn create_producer(
    db: &mut Database,
    new_name: String,
    new_number_messages: i32,
    new_average_send_delay: i32,
    new_failure_rate: i32,
    senders: Option<i32>,
) -> Result<Producer, SMSManagerError> {
    let new_producer = NewProducer {
        name: new_name,
        number_messages: new_number_messages,
        average_send_delay: new_average_send_delay,
        failure_rate: new_failure_rate,
        num_senders: senders,
        status: "INACTIVE".to_string(),
    };

    diesel::insert_into(producers)
        .values(new_producer)
        .get_result(db)
        .map_err(SMSManagerError::DbError)
}

/**
 *
 */
pub async fn update_producer(
    db: &mut Database,
    producer_id: String,
    new_name: String,
    new_number_messages: i32,
    new_average_send_delay: i32,
    new_failure_rate: i32,
    senders: Option<i32>,
) -> Result<Producer, SMSManagerError> {
    let producer_uuid = parse_uuid(&producer_id)?;

    diesel::update(producers.find(producer_uuid))
        .set((
            name.eq(new_name),
            number_messages.eq(new_number_messages),
            average_send_delay.eq(new_average_send_delay),
            num_senders.eq(senders),
            failure_rate.eq(new_failure_rate),
        ))
        .get_result(db)
        .map_err(SMSManagerError::DbError)
}

/**
 *
 */
pub async fn get_all_producers(db: &mut Database) -> Result<Vec<Producer>, SMSManagerError> {
    producers
        .load::<Producer>(db)
        .map_err(SMSManagerError::DbError)
}

/**
 *
 */
pub async fn get_producer_by_id(
    db: &mut Database,
    producer_id: String,
) -> Result<Producer, SMSManagerError> {
    let producer_uuid = parse_uuid(&producer_id)?;

    let found_producers: Vec<Producer> = producers
        .filter(id.eq(producer_uuid))
        .load(db)
        .map_err(SMSManagerError::DbError)?;

    if let Some(producer) = found_producers.first() {
        return Ok(producer.clone());
    }
    Err(SMSManagerError::EmptyResult)
}

/**
 *
 */
pub async fn get_producer_progress_data(
    db: &mut Database,
    producer_id: String,
) -> Result<ProgressData, SMSManagerError> {
    let producer = get_producer_by_id(db, producer_id).await?;

    let found_messages: Vec<Message> = messages
        .filter(produced_by.eq(producer.id))
        .load(db)
        .map_err(SMSManagerError::DbError)?;

    let number_of_messages = found_messages.len();

    let number_of_failed_messages = found_messages.iter().filter(|val| val.failed).count();

    let sent_messages = found_messages
        .iter()
        .filter(|val| val.sent && val.time_took.is_some());

    let mut message_times = vec![];
    let (total_time_for_message, count) = sent_messages.fold((0u32, 0), |(sum, count), item| {
        message_times.push(item.time_took.unwrap()); // we can unwrap as we checked the value exists in the initial filter
        (sum + item.time_took.unwrap() as u32, count + 1)
    });

    let mut average_time_for_message: f64 = 0.0;
    if count != 0 {
        average_time_for_message = total_time_for_message as f64 / count as f64
    }

    Ok(ProgressData {
        number_messages_created: number_of_messages as i32,
        number_messages_sent: count,
        number_messages_failed: number_of_failed_messages as i32,
        average_message_time: average_time_for_message as i32,
        message_times,
    })
}

/**
 *
 */
pub async fn generate_messages(
    db: &mut Database,
    producer_id: String,
) -> Result<i32, SMSManagerError> {
    let producer = get_producer_by_id(db, producer_id).await?;

    let mut message_array =
        Vec::with_capacity(producer.number_messages.try_into().map_err(|_err| {
            SMSManagerError::InvalidEncoding("Could not initialize message array".to_string())
        })?);

    for _ in 0..producer.number_messages {
        message_array.push(create_message(&producer));
    }

    println!("Inserting messages: {}", message_array.len());

    diesel::update(producers.find(producer.id))
        .set(status.eq("GENERATING"))
        .execute(db)
        .map_err(SMSManagerError::DbError)?;

    // Batch Insert
    insert_into(messages)
        .values(message_array)
        .execute(db)
        .map_err(SMSManagerError::DbError)?;

    diesel::update(producers.find(producer.id))
        .set(status.eq("GENERATED"))
        .execute(db)
        .map_err(SMSManagerError::DbError)?;

    Ok(producer.number_messages)
}

/**
 * 
 */
pub async fn activate_producer(
    pool: Arc<PoolHandle>,
    producer_id: String,
) -> Result<String, SMSManagerError> {
    let mut first_connection = pool.get()?;

    let producer_uuid = parse_uuid(&producer_id)?;

    let producer = get_producer_by_id(&mut first_connection, producer_id).await?;

    if producer.status == "SENDING" {
        return Err(SMSManagerError::GeneralException(
            "Already sending messages".to_string(),
        ));
    }

    let found_messages: Vec<Message> = messages
        .filter(produced_by.eq(producer_uuid).and(sent.eq(false)))
        .load(&mut first_connection)
        .map_err(SMSManagerError::DbError)?;

    let queue = Arc::new(Mutex::new(VecDeque::from(found_messages)));

    // Determine the number of threads to use (defaults to number of cores)
    let mut num_threads = match producer.num_senders {
        Some(val) => val,
        None => num_cpus::get() as i32,
    };

    if num_threads > num_cpus::get() as i32 {
        num_threads = num_cpus::get() as i32
    } else if num_threads <= 0 {
        num_threads = 1;
    }

    println!("Using {} threads.", num_threads);

    diesel::update(producers.find(producer_uuid))
        .set(status.eq("SENDING"))
        .execute(&mut first_connection)
        .map_err(SMSManagerError::DbError)?;

    let mut handles = vec![];

    let (tx, mut rx) = mpsc::channel::<Message>(100);
    let active_threads = Arc::new(AtomicUsize::new(num_threads.try_into().unwrap())); // Verified it is positive integer earlier
    let notify = Arc::new(Notify::new());

    // Spawn the threads and process the queue
    for _ in 0..num_threads {
        let queue = Arc::clone(&queue);
        let producer = producer.clone();
        let tx = tx.clone(); // Clone the sender for each thread
        let active_threads = Arc::clone(&active_threads);
        let notify = Arc::clone(&notify);

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

    let db_updater_handle = tokio::spawn(async move {
        while let Some(message) = rx.recv().await {
            let mut thread_connection = pool.get().unwrap();

            // Update the message in the database
            match diesel::update(messages.find(message.id))
                .set((
                    sent.eq(message.sent),
                    time_took.eq(message.time_took),
                    failed.eq(message.failed),
                ))
                .execute(&mut thread_connection)
            {
                Ok(_) => println!("Updated message {} in the database.", message.id),
                Err(err) => eprintln!("Failed to update message {}: {}", message.id, err),
            }

            let _ = diesel::update(producers.find(producer_uuid))
                .set(status.eq("SENDING"))
                .execute(&mut thread_connection)
                .map_err(SMSManagerError::DbError);
        }

        println!("Database updater thread finished. Queue is empty.");
    });
    handles.push(db_updater_handle);

    for handle in handles {
        handle.await.unwrap();
    }

    notify.notified().await;

    diesel::update(producers.find(producer_uuid))
        .set(status.eq("EMPTY"))
        .execute(&mut first_connection)
        .map_err(SMSManagerError::DbError)?;

    Ok("All items processed.".to_string())
}
