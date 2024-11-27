use crate::diesel::models::{NewMessage, Producer};

use super::random_utils::generate_random_string;

/// Creates a fake message by generating a random string for the body and using that.
/// Associates the message with the given producer
///
/// # Parameters
/// - producer: The producer that is creating the message
pub fn create_message(producer: &Producer) -> NewMessage {
    let body = generate_random_string();
    NewMessage {
        message_body: body,
        produced_by: producer.id,
    }
}
