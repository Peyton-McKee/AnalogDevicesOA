use serde::Serialize;

// The struct defining the producer format sent to the frontend
#[derive(Serialize, Debug)]
pub struct PublicProducer {
    pub id: String,
    pub name: String,
    pub number_messages: i32,
    pub average_send_delay: i32,
    pub num_senders: Option<i32>,
}

/// convert the diesel type to the client type for JSON encoding
impl From<crate::diesel::models::Producer> for PublicProducer {
    fn from(value: crate::diesel::models::Producer) -> Self {
        PublicProducer {
            id: value.id.to_string(),
            average_send_delay: value.average_send_delay,
            name: value.name,
            number_messages: value.number_messages,
            num_senders: value.num_senders,
        }
    }
}
