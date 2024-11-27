use std::{
    collections::VecDeque,
    sync::{atomic::AtomicUsize, Arc},
    time::Duration,
};

use backend::{
    diesel::models::{Message, Producer},
    utils::sender::get_senders,
};
use tokio::{
    sync::{mpsc, Mutex, Notify},
    time::timeout,
};
use uuid::Uuid;

#[tokio::test]
async fn test_get_senders_processes_messages() {
    // Setup the queue
    let producer = Producer {
        id: Uuid::new_v4(),
        name: "aProducer".to_string(),
        num_senders: None,
        number_messages: 2,
        status: "GENERATED".to_string(),
        average_send_delay: 1, // Simulated 1-second delay
        failure_rate: 0,       // No failure rate for deterministic testing
    };

    let message1 = Message {
        id: Uuid::new_v4(),
        sent: false,
        time_took: None,
        failed: false,
        message_body: String::from("Test Message 1"),
        produced_by: producer.id,
    };
    let message2 = Message {
        id: Uuid::new_v4(),
        sent: false,
        time_took: None,
        failed: false,
        message_body: String::from("Test Message 2"),
        produced_by: producer.id,
    };

    let queue = Arc::new(Mutex::new(VecDeque::from(vec![message1, message2])));

    let (tx, mut rx) = mpsc::channel(10);
    let active_threads = Arc::new(AtomicUsize::new(2)); // Two threads
    let notify = Arc::new(Notify::new());

    let handles = get_senders(
        queue.clone(),
        &producer,
        &tx,
        active_threads.clone(),
        &notify,
        2,
    );

    for handle in handles {
        handle.await.unwrap();
    }

    let processed_message1 = timeout(Duration::from_secs(3), rx.recv())
        .await
        .unwrap()
        .unwrap();
    let processed_message2 = timeout(Duration::from_secs(3), rx.recv())
        .await
        .unwrap()
        .unwrap();

    assert!(!processed_message1.failed);
    assert!(processed_message1.sent);
    assert!(!processed_message2.failed);
    assert!(processed_message2.sent);

    assert!(queue.lock().await.is_empty());
}

#[tokio::test]
async fn test_get_senders_handles_empty_queue() {
    let queue: Arc<Mutex<VecDeque<Message>>> = Arc::new(Mutex::new(VecDeque::new()));
    let producer = Producer {
        id: Uuid::new_v4(),
        name: "aProducer".to_string(),
        num_senders: None,
        number_messages: 2,
        status: "GENERATED".to_string(),
        average_send_delay: 1,
        failure_rate: 0,
    };
    let (tx, mut rx) = mpsc::channel(10);
    let active_threads = Arc::new(AtomicUsize::new(1));
    let notify = Arc::new(Notify::new());

    let handles = get_senders(
        queue.clone(),
        &producer,
        &tx,
        active_threads.clone(),
        &notify,
        1,
    );

    for handle in handles {
        handle.await.unwrap();
    }

    assert!(rx.try_recv().is_err());
    assert!(queue.lock().await.is_empty());
}
