use uuid::Uuid;

use crate::diesel::models::NewMessage;

use super::random_utils::generate_random_string;

/// Creates a fake message by generating a random string for the body and using that.
/// Associates the message with the given producer
///
/// # Parameters
/// - producer_id: The id of the producer that is creating the message
pub fn create_message(producer_id: Uuid) -> NewMessage {
    let body = generate_random_string();
    NewMessage {
        message_body: body,
        produced_by: producer_id,
    }
}
