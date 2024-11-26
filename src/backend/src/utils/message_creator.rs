use crate::diesel::models::{NewMessage, Producer};

use super::random_utils::generate_random_string;

/**
 *
 */
pub fn create_message(producer: &Producer) -> NewMessage {
    let body = generate_random_string();
    NewMessage {
        message_body: body,
        produced_by: producer.id,
    }
}
