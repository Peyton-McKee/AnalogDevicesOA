use std::{collections::VecDeque, sync::Arc};


use diesel::{
    dsl::insert_into,
    query_dsl::methods::{FilterDsl, FindDsl},
    BoolExpressionMethods, ExpressionMethods, RunQueryDsl,
};
use tokio::sync::Mutex;

use crate::utils::message_utils::{generate_fake_messages, get_producer_info_from_messages};
use crate::utils::sender::send_messages;
use crate::{
    diesel::{
        models::{Message, NewProducer, Producer},
        schema::{
            messages::{dsl::messages, produced_by, sent},
            producers::dsl::*,
        },
    },
    transformers::producer_transformer::ProgressData,
    utils::{
        error::SMSManagerError,
        uuid::parse_uuid,
    },
    Database, PoolHandle,
};

/// Creates a producer in the database with the provided options. Sets the status to INACTIVE
///
/// # Params
/// - db: The database connection to make the request on
/// - new_name: The name to assign the producer
/// - new_number_messages: The number of messages this producer will generate when calling generate_messages
/// - new_average_send_delay: The average time in seconds it will take for an individual sender to send a message
/// - new_failure_rate: The average rate at which the senders will fail to send a message as a percentage from 0 - 100
/// - senders: An optional number of senders to initialize when activating the producer, null indicates that it will use the number of cores available on the machine
///
/// ### Errors if database insertion fails, failure rate is not between 0 and 100 or number of messages or send delay < 1
///
/// # Example
/// create_producer(db, "New Producer", 100, 20, 10);
///
/// This will create a producer with the name "New Producer" that generates 100 messages,
/// takes on average 20 seconds to send each message and fails to send a message 10% of the time.
/// When sending messages it will use the number of available cores on the machine.
pub async fn create_producer(
    db: &mut Database,
    new_name: String,
    new_number_messages: i32,
    new_average_send_delay: i32,
    new_failure_rate: i32,
    senders: Option<i32>,
) -> Result<Producer, SMSManagerError> {
    if !(0..=100).contains(&new_failure_rate) {
        return Err(SMSManagerError::GeneralException(
            "Failure rate must be within 0 - 100".to_string(),
        ));
    }

    if new_number_messages < 1 || new_average_send_delay < 1 {
        return Err(SMSManagerError::GeneralException(
            "Number of messages and average send delay must be greater than or equal to 1"
                .to_string(),
        ));
    }

    let new_producer = NewProducer {
        name: new_name,
        number_messages: new_number_messages,
        average_send_delay: new_average_send_delay,
        failure_rate: new_failure_rate,
        num_senders: senders,
        status: "INACTIVE".to_string(),
    };

    diesel::insert_into(producers)
        .values(new_producer)
        .get_result(db)
        .map_err(SMSManagerError::DbError)
}

/// Updates the producer with the given id to have the provided values
///
/// # Params
/// - db: The database connection to make the request on
/// - new_name: The name to assign the producer
/// - new_number_messages: The number of messages this producer will generate when calling generate_messages
/// - new_average_send_delay: The average time in seconds it will take for an individual sender to send a message
/// - new_failure_rate: The average rate at which the senders will fail to send a message as a percentage from 0 - 100
/// - senders: An optional number of senders to initialize when activating the producer, null indicates that it will use the number of cores available on the machine
///
/// ### Errors if producer doesn't exist, database update fails, failure rate is not between 0 and 100, or number of messages or send delay < 1
///
/// # Example
/// create_producer(db, "aProducerId", "New Producer", 100, 20, 10);
///
/// This will update the producer with id "aProducerId" to have the name "New Producer", generate 100 messages,
/// take on average 20 seconds to send each message and fail to send a message 10% of the time.
/// When sending messages it will use the number of available cores on the machine.
pub async fn update_producer(
    db: &mut Database,
    producer_id: String,
    new_name: String,
    new_number_messages: i32,
    new_average_send_delay: i32,
    new_failure_rate: i32,
    senders: Option<i32>,
) -> Result<Producer, SMSManagerError> {
    if !(0..=100).contains(&new_failure_rate) {
        return Err(SMSManagerError::GeneralException(
            "Failure rate must be within 0 - 100".to_string(),
        ));
    }

    if new_number_messages < 1 || new_average_send_delay < 1 {
        return Err(SMSManagerError::GeneralException(
            "Number of messages and average send delay must be greater than or equal to 1"
                .to_string(),
        ));
    }

    let producer_uuid = parse_uuid(&producer_id)?;

    diesel::update(producers.find(producer_uuid))
        .set((
            name.eq(new_name),
            number_messages.eq(new_number_messages),
            average_send_delay.eq(new_average_send_delay),
            num_senders.eq(senders),
            failure_rate.eq(new_failure_rate),
        ))
        .get_result(db)
        .map_err(SMSManagerError::DbError)
}

/// Gets all the producers in the database
///
/// # Parameters
/// - db: The database connection to make the request with
///
/// ### Errors if query fails
pub async fn get_all_producers(db: &mut Database) -> Result<Vec<Producer>, SMSManagerError> {
    producers
        .load::<Producer>(db)
        .map_err(SMSManagerError::DbError)
}

/// Gets the producer with the supplied id from the database
///
/// # Paramters
/// - db: The database connection to make requests with
/// - producer_id: The id of the producer to get
///
/// ### Errors if producer is not found
pub async fn get_producer_by_id(
    db: &mut Database,
    producer_id: String,
) -> Result<Producer, SMSManagerError> {
    let producer_uuid = parse_uuid(&producer_id)?;

    let found_producers: Vec<Producer> = producers
        .filter(id.eq(producer_uuid))
        .load(db)
        .map_err(SMSManagerError::DbError)?;

    if let Some(producer) = found_producers.first() {
        return Ok(producer.clone());
    }
    Err(SMSManagerError::EmptyResult)
}

/// Gets the progress data for the producer with the given producer id
///
/// # Paramters
/// - db: The database connection to make requests with
/// - producer_id: The id of the producer to get the progress data for
///
/// ### Errors if producer is not found
pub async fn get_producer_progress_data(
    db: &mut Database,
    producer_id: String,
) -> Result<ProgressData, SMSManagerError> {
    let producer = get_producer_by_id(db, producer_id).await?;

    let found_messages: Vec<Message> = messages
        .filter(produced_by.eq(producer.id))
        .load(db)
        .map_err(SMSManagerError::DbError)?;

    let (
        number_messages_created,
        number_messages_failed,
        message_times,
        number_messages_sent,
        average_message_time,
    ) = get_producer_info_from_messages(found_messages);

    Ok(ProgressData {
        number_messages_created,
        number_messages_sent,
        number_messages_failed,
        average_message_time,
        message_times,
    })
}

/// Generates the messages for the producer.
/// Number of messages generated is set on the producers number_messages field
/// Sets the producers status to generating prior to message creation, sets it to generated afterwards
///
/// # Paramters
/// - db: The database connection to make requests with
/// - producer_id: The id of the producer to generate the messages for
///
/// ### Errors if producer is not found, number of messages is invalid, or updating statuses or inserting messages fails
pub async fn generate_messages(
    db: &mut Database,
    producer_id: String,
) -> Result<i32, SMSManagerError> {
    let producer = get_producer_by_id(db, producer_id).await?;

    let message_array = generate_fake_messages(producer.number_messages, producer.id)?;

    println!("Inserting messages: {}", message_array.len());

    diesel::update(producers.find(producer.id))
        .set(status.eq("GENERATING"))
        .execute(db)
        .map_err(SMSManagerError::DbError)?;

    // Batch Insert
    insert_into(messages)
        .values(message_array)
        .execute(db)
        .map_err(SMSManagerError::DbError)?;

    diesel::update(producers.find(producer.id))
        .set(status.eq("GENERATED"))
        .execute(db)
        .map_err(SMSManagerError::DbError)?;

    Ok(producer.number_messages)
}

/// Sends the pending messages for the producer with the given id
/// First queries all messages that have not been sent yet, then calculates the number of threads to use for sending the messages.
/// The calculation first checks if the producer configured number of threads is a valid number of threads (between 1 and the max number of cpus) and clamps it if not
/// Then the producers status is updated to SENDING
/// Then a multiple producer single consumer structure with senders sending the messages and a database updater updating the sent messages is used. This ensures that we maximize how fast we can send out messages, while at the same time not overloading our database resources and allowing availability for queries to the database to be made
/// Then the producers status is updated to EMPTY
///
/// # Paramters
/// - db: The database connection to make requests with
/// - producer_id: The id of the producer to send the messages of
///
/// ### Errors if producer is not found, finding the producers messages fails, or updating statuses or sending messages fails
pub async fn activate_producer(
    pool: Arc<PoolHandle>,
    producer_id: String,
) -> Result<String, SMSManagerError> {
    let producer_uuid = parse_uuid(&producer_id)?;
    let mut db = pool.get()?;

    let producer = get_producer_by_id(&mut db, producer_id).await?;

    if producer.status == "SENDING" {
        return Err(SMSManagerError::GeneralException(
            "Already sending messages".to_string(),
        ));
    }

    let found_messages: Vec<Message> = messages
        .filter(produced_by.eq(producer_uuid).and(sent.eq(false)))
        .load(&mut db)
        .map_err(SMSManagerError::DbError)?;

    let queue = Arc::new(Mutex::new(VecDeque::from(found_messages)));

    // Determine the number of threads to use (defaults to number of cores)
    let mut num_threads = match producer.num_senders {
        Some(val) => val,
        None => num_cpus::get() as i32,
    };

    if num_threads > num_cpus::get() as i32 {
        num_threads = num_cpus::get() as i32
    } else if num_threads <= 0 {
        num_threads = 1;
    }

    println!("Using {} threads.", num_threads);

    diesel::update(producers.find(producer_uuid))
        .set(status.eq("SENDING"))
        .execute(&mut db)
        .map_err(SMSManagerError::DbError)?;

    send_messages(queue, pool, &producer, num_threads).await;

    diesel::update(producers.find(producer_uuid))
        .set(status.eq("EMPTY"))
        .execute(&mut db)
        .map_err(SMSManagerError::DbError)?;

    Ok("All items processed.".to_string())
}

/// Deletes the producer and messages with the given id
///
/// # Paramters
/// - db: The database connection to make requests with
/// - producer_id: The id of the producer to delete
///
/// ### Errors if producer is not found, deleting the messages fails, or deleting the producer fails
pub async fn delete_producer(
    db: &mut Database,
    producer_id: String,
) -> Result<String, SMSManagerError> {
    let producer = get_producer_by_id(db, producer_id).await?;

    let _ = diesel::delete(messages)
        .filter(produced_by.eq(producer.id))
        .execute(db);
    let _ = diesel::delete(producers)
        .filter(id.eq(producer.id))
        .execute(db);

    Ok("Successfully deleted producer".to_string())
}
