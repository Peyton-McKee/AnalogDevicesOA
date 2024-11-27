use std::sync::Arc;

use backend::{
    diesel::{
        models::{Message, NewMessage},
        schema::messages::dsl::*,
    },
    services::producer_services::create_producer,
    utils::sender::get_message_updater,
};
use diesel::RunQueryDsl;
use tokio::sync::mpsc;

use crate::test_utils::cleanup_and_prepare;

#[tokio::test]
async fn test_message_updater_updates_message_statuses() {
    let pool = cleanup_and_prepare().await.unwrap();
    let mut db: diesel::r2d2::PooledConnection<
        diesel::r2d2::ConnectionManager<diesel::PgConnection>,
    > = pool.get().unwrap();

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

    let message1 = NewMessage {
        message_body: String::from("Test Message 1"),
        produced_by: producer.id,
    };
    let message2 = NewMessage {
        message_body: String::from("Test Message 2"),
        produced_by: producer.id,
    };

    let created_messages: Vec<Message> = diesel::insert_into(messages)
        .values(vec![message1, message2])
        .get_results(&mut db)
        .unwrap();

    let (tx, rx) = mpsc::channel(10);

    let _ = tx
        .send(Message {
            id: created_messages.first().unwrap().id,
            message_body: "aBody".to_string(),
            sent: true,
            failed: false,
            time_took: Some(5),
            produced_by: producer.id,
        })
        .await;

    let _ = tx
        .send(Message {
            id: created_messages.last().unwrap().id,
            message_body: "aBody".to_string(),
            sent: true,
            failed: true,
            time_took: Some(10),
            produced_by: producer.id,
        })
        .await;

    let handle = get_message_updater(rx, Arc::new(pool));

    drop(tx);

    let _ = handle.await;

    let updated_messages: Vec<Message> = messages.load(&mut db).unwrap();

    assert!(updated_messages.first().unwrap().sent);
    assert!(!updated_messages.first().unwrap().failed);
    assert_eq!(updated_messages.first().unwrap().time_took, Some(5));

    assert!(updated_messages.last().unwrap().sent);
    assert!(updated_messages.last().unwrap().failed);
    assert_eq!(updated_messages.last().unwrap().time_took, Some(10));
}
