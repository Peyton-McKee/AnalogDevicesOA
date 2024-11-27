use backend::utils::message_creator::create_message;
use uuid::Uuid;

#[tokio::test]
async fn test_create_message() {
    let producer_id = Uuid::new_v4();

    let result = create_message(producer_id);

    assert!(
        !result.message_body.is_empty(),
        "The message body should not be empty"
    );
    assert!(
        result.message_body.len() <= 100,
        "The message body length should not exceed 100 characters"
    );
    assert!(
        result.message_body.chars().all(|c| c.is_alphanumeric()),
        "The message body should only contain alphanumeric characters"
    );
    assert_eq!(
        result.produced_by, producer_id,
        "The produced_by field should match the producer ID"
    );
}
