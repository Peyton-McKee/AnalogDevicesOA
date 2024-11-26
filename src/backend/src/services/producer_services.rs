use std::{
    collections::VecDeque,
    sync::{Arc, Mutex},
    thread::sleep,
    time::{Duration, SystemTime},
};

use diesel::{
    dsl::insert_into,
    query_dsl::methods::{FilterDsl, FindDsl},
    ExpressionMethods, RunQueryDsl,
};
use rayon::iter::{IntoParallelIterator, ParallelIterator};

use crate::{
    diesel::{
        models::{Message, NewProducer, Producer},
        schema::{
            message::{dsl::message, failed, produced_by, sent, time_took},
            producer::dsl::*,
        },
    },
    utils::{
        error::SMSManagerError,
        message_creator::create_message,
        random_utils::{get_random_wait_time, random_chance},
        uuid::parse_uuid,
    },
    Database, PoolHandle,
};

/**
 *
 */
pub async fn create_producer(
    db: &mut Database,
    new_name: String,
    new_number_messages: i32,
    new_average_send_delay: i32,
    new_failure_rate: i32,
    senders: Option<i32>,
) -> Result<Producer, SMSManagerError> {
    let new_producer = NewProducer {
        name: new_name,
        number_messages: new_number_messages,
        average_send_delay: new_average_send_delay,
        failure_rate: new_failure_rate,
        num_senders: senders,
    };

    diesel::insert_into(producer)
        .values(new_producer)
        .get_result(db)
        .map_err(SMSManagerError::DbError)
}

/**
 *
 */
pub async fn update_producer(
    db: &mut Database,
    producer_id: String,
    new_name: String,
    new_number_messages: i32,
    new_average_send_delay: i32,
    new_failure_rate: i32,
    senders: Option<i32>,
) -> Result<Producer, SMSManagerError> {
    let producer_uuid = parse_uuid(&producer_id)?;

    diesel::update(producer.find(producer_uuid))
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

/**
 *
 */
pub async fn get_all_producers(db: &mut Database) -> Result<Vec<Producer>, SMSManagerError> {
    producer
        .load::<Producer>(db)
        .map_err(SMSManagerError::DbError)
}

/**
 *
 */
pub async fn get_producer_by_id(
    db: &mut Database,
    producer_id: String,
) -> Result<Producer, SMSManagerError> {
    let producer_uuid = parse_uuid(&producer_id)?;

    let producers: Vec<Producer> = producer
        .filter(id.eq(producer_uuid))
        .load(db)
        .map_err(SMSManagerError::DbError)?;

    if let Some(producer_val) = producers.first() {
        return Ok(producer_val.clone());
    }
    Err(SMSManagerError::EmptyResult)
}

/**
 *
 */
pub async fn generate_messages(
    db: &mut Database,
    producer_id: String,
) -> Result<i32, SMSManagerError> {
    let found_producer = get_producer_by_id(db, producer_id).await?;

    let mut message_array =
        Vec::with_capacity(found_producer.number_messages.try_into().map_err(|_err| {
            SMSManagerError::InvalidEncoding("Could not initialize message array".to_string())
        })?);

    for _ in 0..message_array.len() {
        message_array.push(create_message(&found_producer));
    }

    // Batch Insert
    insert_into(message)
        .values(message_array)
        .execute(db)
        .map_err(SMSManagerError::DbError)?;

    Ok(found_producer.number_messages)
}

/**
 *
 */
pub async fn activate_producer(
    pool: Arc<PoolHandle>,
    producer_id: String,
) -> Result<String, SMSManagerError> {
    let mut first_connection = pool.get()?;

    let producer_uuid = parse_uuid(&producer_id)?;

    let found_producer = get_producer_by_id(&mut first_connection, producer_id).await?;

    let messages: Vec<Message> = message
        .filter(produced_by.eq(producer_uuid))
        .load(&mut first_connection)
        .map_err(SMSManagerError::DbError)?;

    let queue = Arc::new(Mutex::new(VecDeque::from(messages)));

    // Determine the number of threads to use (defaults to number of cores)
    let num_threads = rayon::current_num_threads();

    println!("Using {} threads.", num_threads);

    // Spawn the threads and process the queue
    (0..num_threads).into_par_iter().for_each(|_| {
        let mut thread_connection = pool.get().unwrap();
        let queue = Arc::clone(&queue);

        while let Some(item) = {
            let mut q = queue.lock().unwrap();
            q.pop_front()
        } {
            println!("Processing item: {}", item.id);

            let begin_time = SystemTime::now();

            let wait_time = get_random_wait_time(&found_producer.average_send_delay);

            // Simulate work with an arbitrary delay
            sleep(Duration::from_millis(wait_time));

            let time = SystemTime::now()
                .duration_since(begin_time)
                .unwrap()
                .as_secs() as i32;

            let did_fail = random_chance(found_producer.failure_rate);

            // Update Message in DB
            match diesel::update(message.find(item.id))
                .set((sent.eq(true), time_took.eq(time), failed.eq(did_fail)))
                .execute(&mut thread_connection)
            {
                Ok(_val) => println!("Finished processing item: {}", item.id),
                Err(err) => println!("Error when updating item: {}", err),
            }
        }
    });

    Ok("All items processed.".to_string())
}
