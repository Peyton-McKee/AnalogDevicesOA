use std::sync::Arc;

use backend::{
    diesel::{
        models::{Message, NewMessageFull},
        schema::messages::dsl::*,
    },
    services::producer_services::{
        activate_producer, create_producer, delete_producer, generate_messages, get_all_producers,
        get_producer_by_id, get_producer_progress_data, update_producer,
    },
    utils::error::SMSManagerError,
};
use diesel::RunQueryDsl;

use crate::test_utils::cleanup_and_prepare;

#[tokio::test]
async fn test_create_producer_valid_data() {
    let mut db = cleanup_and_prepare().await.unwrap().get().unwrap();

    let new_name = "Valid Producer".to_string();
    let new_number_messages = 100;
    let new_average_send_delay = 20;
    let new_failure_rate = 10;
    let senders = Some(4);

    let result = create_producer(
        &mut db,
        new_name,
        new_number_messages,
        new_average_send_delay,
        new_failure_rate,
        senders,
    )
    .await;

    assert!(result.is_ok());
    let producer = result.unwrap();
    assert_eq!(producer.name, "Valid Producer");
    assert_eq!(producer.number_messages, 100);
    assert_eq!(producer.average_send_delay, 20);
    assert_eq!(producer.failure_rate, 10);
    assert_eq!(producer.num_senders, Some(4));
    assert_eq!(producer.status, "INACTIVE");
}

#[tokio::test]
async fn test_create_producer_invalid_failure_rate() {
    let mut db = cleanup_and_prepare().await.unwrap().get().unwrap();

    let new_name = "Invalid Failure Rate".to_string();
    let new_number_messages = 100;
    let new_average_send_delay = 20;
    let new_failure_rate = 101; // Invalid failure rate
    let senders = Some(4);

    let result = create_producer(
        &mut db,
        new_name,
        new_number_messages,
        new_average_send_delay,
        new_failure_rate,
        senders,
    )
    .await;

    assert!(result.is_err());
    match result.unwrap_err() {
        SMSManagerError::GeneralException(msg) => {
            assert_eq!(msg, "Failure rate must be within 0 - 100");
        }
        _ => panic!("Expected GeneralException error"),
    }
}

#[tokio::test]
async fn test_create_producer_invalid_number_messages() {
    let mut db = cleanup_and_prepare().await.unwrap().get().unwrap();

    let new_name = "Invalid Number of Messages".to_string();
    let new_number_messages = 0; // Invalid number of messages
    let new_average_send_delay = 20;
    let new_failure_rate = 10;
    let senders = Some(4);

    let result = create_producer(
        &mut db,
        new_name,
        new_number_messages,
        new_average_send_delay,
        new_failure_rate,
        senders,
    )
    .await;

    assert!(result.is_err());
    match result.unwrap_err() {
        SMSManagerError::GeneralException(msg) => {
            assert_eq!(
                msg,
                "Number of messages and average send delay must be greater than or equal to 1"
            );
        }
        _ => panic!("Expected GeneralException error"),
    }
}

#[tokio::test]
async fn test_create_producer_invalid_average_send_delay() {
    let mut db = cleanup_and_prepare().await.unwrap().get().unwrap();

    let new_name = "Invalid Average Send Delay".to_string();
    let new_number_messages = 100;
    let new_average_send_delay = 0; // Invalid average send delay
    let new_failure_rate = 10;
    let senders = Some(4);

    let result = create_producer(
        &mut db,
        new_name,
        new_number_messages,
        new_average_send_delay,
        new_failure_rate,
        senders,
    )
    .await;

    assert!(result.is_err());
    match result.unwrap_err() {
        SMSManagerError::GeneralException(msg) => {
            assert_eq!(
                msg,
                "Number of messages and average send delay must be greater than or equal to 1"
            );
        }
        _ => panic!("Expected GeneralException error"),
    }
}

#[tokio::test]
async fn test_update_producer_valid_data() {
    let mut db = cleanup_and_prepare().await.unwrap().get().unwrap();

    let new_name = "Updated Producer";
    let new_number_messages = 100;
    let new_average_send_delay = 20;
    let new_failure_rate = 10;
    let senders = Some(4);

    let producer = create_producer(
        &mut db,
        new_name.to_string(),
        new_number_messages,
        new_average_send_delay,
        new_failure_rate,
        senders,
    )
    .await;

    let result = update_producer(
        &mut db,
        producer.unwrap().id.to_string(),
        new_name.to_string(),
        new_number_messages,
        new_average_send_delay,
        new_failure_rate,
        senders,
    )
    .await;

    assert!(result.is_ok());
    let producer = result.unwrap();
    assert_eq!(producer.name, new_name);
    assert_eq!(producer.number_messages, new_number_messages);
    assert_eq!(producer.average_send_delay, new_average_send_delay);
    assert_eq!(producer.failure_rate, new_failure_rate);
    assert_eq!(producer.status, "INACTIVE");
}

#[tokio::test]
async fn test_update_producer_invalid_failure_rate() {
    let mut db = cleanup_and_prepare().await.unwrap().get().unwrap();

    let producer_id = "some-uuid";
    let new_name = "Invalid Failure Rate".to_string();
    let new_number_messages = 100;
    let new_average_send_delay = 20;
    let new_failure_rate = 101; // Invalid failure rate
    let senders = Some(4);

    // Call update_producer with invalid data
    let result = update_producer(
        &mut db,
        producer_id.to_string(),
        new_name,
        new_number_messages,
        new_average_send_delay,
        new_failure_rate,
        senders,
    )
    .await;

    // Assert that the error is returned
    assert!(result.is_err());
    match result.unwrap_err() {
        SMSManagerError::GeneralException(msg) => {
            assert_eq!(msg, "Failure rate must be within 0 - 100");
        }
        _ => panic!("Expected GeneralException error"),
    }
}

#[tokio::test]
async fn test_update_producer_invalid_number_messages() {
    let mut db = cleanup_and_prepare().await.unwrap().get().unwrap();

    let producer_id = "some-uuid";
    let new_name = "Invalid Number of Messages".to_string();
    let new_number_messages = 0; // Invalid number of messages
    let new_average_send_delay = 20;
    let new_failure_rate = 10;
    let senders = Some(4);

    let result = update_producer(
        &mut db,
        producer_id.to_string(),
        new_name,
        new_number_messages,
        new_average_send_delay,
        new_failure_rate,
        senders,
    )
    .await;

    assert!(result.is_err());
    match result.unwrap_err() {
        SMSManagerError::GeneralException(msg) => {
            assert_eq!(
                msg,
                "Number of messages and average send delay must be greater than or equal to 1"
            );
        }
        _ => panic!("Expected GeneralException error"),
    }
}

#[tokio::test]
async fn test_update_producer_not_found() {
    let mut db = cleanup_and_prepare().await.unwrap().get().unwrap();

    let producer_id = "some-uuid";
    let new_name = "Updated Producer".to_string();
    let new_number_messages = 100;
    let new_average_send_delay = 20;
    let new_failure_rate = 10;
    let senders = Some(4);

    let result = update_producer(
        &mut db,
        producer_id.to_string(),
        new_name,
        new_number_messages,
        new_average_send_delay,
        new_failure_rate,
        senders,
    )
    .await;

    assert!(result.is_err());
}

#[tokio::test]
async fn test_get_all_producers() {
    let mut db = cleanup_and_prepare().await.unwrap().get().unwrap();

    let new_name = "Valid Producer".to_string();
    let new_number_messages = 100;
    let new_average_send_delay = 20;
    let new_failure_rate = 10;
    let senders = Some(4);

    let _ = create_producer(
        &mut db,
        new_name,
        new_number_messages,
        new_average_send_delay,
        new_failure_rate,
        senders,
    )
    .await;

    let result = get_all_producers(&mut db).await;

    assert!(result.is_ok());
    let producers = result.unwrap();
    assert_eq!(producers.first().unwrap().name, "Valid Producer");
    assert_eq!(producers.first().unwrap().number_messages, 100);
    assert_eq!(producers.first().unwrap().average_send_delay, 20);
    assert_eq!(producers.first().unwrap().failure_rate, 10);
    assert_eq!(producers.first().unwrap().num_senders, Some(4));
    assert_eq!(producers.first().unwrap().status, "INACTIVE");
}

#[tokio::test]
async fn test_get_producer_by_id() {
    let mut db = cleanup_and_prepare().await.unwrap().get().unwrap();

    let new_name = "Valid Producer".to_string();
    let new_number_messages = 100;
    let new_average_send_delay = 20;
    let new_failure_rate = 10;
    let senders = Some(4);

    let result = create_producer(
        &mut db,
        new_name,
        new_number_messages,
        new_average_send_delay,
        new_failure_rate,
        senders,
    )
    .await;

    let result = get_producer_by_id(&mut db, result.unwrap().id.to_string()).await;

    assert!(result.is_ok());
    let producer = result.unwrap();
    assert_eq!(producer.name, "Valid Producer");
    assert_eq!(producer.number_messages, 100);
    assert_eq!(producer.average_send_delay, 20);
    assert_eq!(producer.failure_rate, 10);
    assert_eq!(producer.num_senders, Some(4));
    assert_eq!(producer.status, "INACTIVE");
}

#[tokio::test]
async fn test_get_producer_progress() {
    let mut db = cleanup_and_prepare().await.unwrap().get().unwrap();

    let new_name = "Valid Producer".to_string();
    let new_number_messages = 100;
    let new_average_send_delay = 20;
    let new_failure_rate = 10;
    let senders = Some(4);

    let producer = create_producer(
        &mut db,
        new_name,
        new_number_messages,
        new_average_send_delay,
        new_failure_rate,
        senders,
    )
    .await
    .unwrap();

    let message1 = NewMessageFull {
        message_body: String::from("Test Message 1"),
        sent: true,
        failed: false,
        time_took: Some(5),
        produced_by: producer.id,
    };
    let message2 = NewMessageFull {
        message_body: String::from("Test Message 2"),
        sent: false,
        failed: false,
        time_took: None,
        produced_by: producer.id,
    };

    let _: Vec<Message> = diesel::insert_into(messages)
        .values(vec![message1, message2])
        .get_results(&mut db)
        .unwrap();

    let progress_data = get_producer_progress_data(&mut db, producer.id.to_string())
        .await
        .unwrap();

    assert_eq!(progress_data.average_message_time, 5);
    assert_eq!(progress_data.message_times, vec![5]);
    assert_eq!(progress_data.number_messages_created, 2);
    assert_eq!(progress_data.number_messages_sent, 1);
    assert_eq!(progress_data.number_messages_failed, 0);
}

#[tokio::test]
async fn test_generate_messages() {
    let mut db = cleanup_and_prepare().await.unwrap().get().unwrap();

    let new_name = "Valid Producer".to_string();
    let new_number_messages = 100;
    let new_average_send_delay = 20;
    let new_failure_rate = 10;
    let senders = Some(4);

    let producer = create_producer(
        &mut db,
        new_name,
        new_number_messages,
        new_average_send_delay,
        new_failure_rate,
        senders,
    )
    .await
    .unwrap();

    let number_of_messages = generate_messages(&mut db, producer.id.to_string())
        .await
        .unwrap();

    let created_messages: Vec<Message> = messages.load(&mut db).unwrap();

    assert_eq!(number_of_messages, 100);
    assert_eq!(created_messages.len(), 100);
}

#[tokio::test]
async fn test_activate_producer() {
    let pool = cleanup_and_prepare().await.unwrap();
    let mut db = pool.get().unwrap();

    let new_name = "Valid Producer".to_string();
    let new_number_messages = 10;
    let new_average_send_delay = 1;
    let new_failure_rate = 50;
    let senders = Some(4);

    let producer = create_producer(
        &mut db,
        new_name,
        new_number_messages,
        new_average_send_delay,
        new_failure_rate,
        senders,
    )
    .await
    .unwrap();

    let _ = generate_messages(&mut db, producer.id.to_string())
        .await
        .unwrap();

    let _ = activate_producer(Arc::new(pool), producer.id.to_string()).await;

    let created_messages: Vec<Message> = messages.load(&mut db).unwrap();

    assert_eq!(created_messages.len(), 10);
    assert!(created_messages.iter().all(|mes| mes.sent));
    assert!(created_messages.iter().any(|mes| mes.failed));
}

#[tokio::test]
async fn test_delete_producer() {
    let mut db = cleanup_and_prepare().await.unwrap().get().unwrap();

    let new_name = "Valid Producer".to_string();
    let new_number_messages = 100;
    let new_average_send_delay = 20;
    let new_failure_rate = 10;
    let senders = Some(4);

    let result = create_producer(
        &mut db,
        new_name,
        new_number_messages,
        new_average_send_delay,
        new_failure_rate,
        senders,
    )
    .await
    .unwrap();

    let message = delete_producer(&mut db, result.id.to_string())
        .await
        .unwrap();

    assert_eq!(message, "Successfully deleted producer");
}
