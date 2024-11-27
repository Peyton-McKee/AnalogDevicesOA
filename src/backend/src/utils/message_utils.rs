use uuid::Uuid;

use crate::diesel::models::{Message, NewMessage};

use super::{error::SMSManagerError, message_creator::create_message};

/// Gets producer info from list of messages
///
/// # Paramters
/// - messages: The list of messages that will be used to extract the producers progress from
///
/// # Returns
/// Tuple in format of (number_messages_created, number_messages_failed, message_times, number_messages_sent, average_message_time)
pub fn get_producer_info_from_messages(messages: Vec<Message>) -> (i32, i32, Vec<i32>, i32, i32) {
    let number_of_messages = messages.len();

    let number_of_failed_messages = messages.iter().filter(|val| val.failed).count();

    let sent_messages = messages
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

    (
        number_of_messages as i32,
        number_of_failed_messages as i32,
        message_times,
        count,
        average_time_for_message as i32,
    )
}

/// Generates total_messages new objects that can be inserted as messages on the given producer_id
///
/// # Parameters
/// - number_messages: The number of messages to generate
/// - producer_id: The producer that is generating the objects
pub fn generate_fake_messages(
    number_messages: i32,
    producer_id: Uuid,
) -> Result<Vec<NewMessage>, SMSManagerError> {
    let mut messages = Vec::with_capacity(number_messages.try_into().map_err(|_err| {
        SMSManagerError::InvalidEncoding("Could not initialize message array".to_string())
    })?);

    for _ in 0..number_messages {
        messages.push(create_message(producer_id));
    }

    Ok(messages)
}
