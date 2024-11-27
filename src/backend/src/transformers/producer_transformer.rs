use serde::Serialize;

// The struct defining the producer format sent to the frontend
#[derive(Serialize, Debug)]
pub struct PublicProducer {
    pub id: String,
    pub name: String,
    pub number_messages: i32,
    pub average_send_delay: i32,
    pub failure_rate: i32,
    pub num_senders: Option<i32>,
    pub status: String,
}

#[derive(Serialize, Debug)]
pub struct ProgressData {
    pub number_messages_created: i32,
    pub number_messages_sent: i32,
    pub number_messages_failed: i32,
    pub average_message_time: i32,
    pub message_times: Vec<i32>,
}

#[derive(Serialize, Debug)]
pub struct PublicProducerWithProgressData {
    pub producer: PublicProducer,
    pub progress_data: ProgressData,
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
            failure_rate: value.failure_rate,
            status: value.status
        }
    }
}
