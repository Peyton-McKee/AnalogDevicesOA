use std::sync::Arc;

use axum::{
    extract::{Path, State},
    Json,
};
use serde::Deserialize;

use crate::{
    services::producer_services,
    transformers::producer_transformer::{ProgressData, PublicProducer},
    utils::error::SMSManagerError,
    PoolHandle,
};

#[derive(Deserialize)]
pub struct ProducerUpdateArgs {
    pub name: String,
    pub number_messages: i32,
    pub average_send_delay: i32,
    pub failure_rate: i32,
    pub num_senders: Option<i32>,
}

pub async fn create_producer(
    State(pool): State<PoolHandle>,
    Json(payload): Json<ProducerUpdateArgs>,
) -> Result<Json<PublicProducer>, SMSManagerError> {
    let mut db = pool.get()?;
    let producer = producer_services::create_producer(
        &mut db,
        payload.name,
        payload.number_messages,
        payload.average_send_delay,
        payload.failure_rate,
        payload.num_senders,
    )
    .await?;

    let transformed_producer: PublicProducer = PublicProducer::from(producer);

    Ok(Json::from(transformed_producer))
}

pub async fn update_producer(
    State(pool): State<PoolHandle>,
    Path(producer_id): Path<String>,
    Json(payload): Json<ProducerUpdateArgs>,
) -> Result<Json<PublicProducer>, SMSManagerError> {
    let mut db = pool.get()?;
    let producer = producer_services::update_producer(
        &mut db,
        producer_id,
        payload.name,
        payload.number_messages,
        payload.average_send_delay,
        payload.failure_rate,
        payload.num_senders,
    )
    .await?;

    let transformed_producer: PublicProducer = PublicProducer::from(producer);

    Ok(Json::from(transformed_producer))
}

pub async fn get_all_producers(
    State(pool): State<PoolHandle>,
) -> Result<Json<Vec<PublicProducer>>, SMSManagerError> {
    let mut db = pool.get()?;
    let producers = producer_services::get_all_producers(&mut db).await?;

    let transformed_producers: Vec<PublicProducer> =
        producers.into_iter().map(PublicProducer::from).collect();

    Ok(Json::from(transformed_producers))
}

pub async fn get_producer_by_id(
    State(pool): State<PoolHandle>,
    Path(producer_id): Path<String>,
) -> Result<Json<PublicProducer>, SMSManagerError> {
    let mut db: diesel::r2d2::PooledConnection<
        diesel::r2d2::ConnectionManager<diesel::PgConnection>,
    > = pool.get()?;
    let producer = producer_services::get_producer_by_id(&mut db, producer_id).await?;

    let transformed_producer: PublicProducer = PublicProducer::from(producer);

    Ok(Json::from(transformed_producer))
}

pub async fn generate_messages(
    State(pool): State<PoolHandle>,
    Path(producer_id): Path<String>,
) -> Result<Json<i32>, SMSManagerError> {
    let mut db: diesel::r2d2::PooledConnection<
        diesel::r2d2::ConnectionManager<diesel::PgConnection>,
    > = pool.get()?;
    let number_messages = producer_services::generate_messages(&mut db, producer_id).await?;

    Ok(Json::from(number_messages))
}

pub async fn activate_producer(
    State(pool): State<PoolHandle>,
    Path(producer_id): Path<String>,
) -> Result<Json<String>, SMSManagerError> {
    let success_message = producer_services::activate_producer(Arc::new(pool), producer_id).await?;

    Ok(Json::from(success_message))
}

pub async fn get_producer_progress_data(
    State(pool): State<PoolHandle>,
    Path(producer_id): Path<String>,
) -> Result<Json<ProgressData>, SMSManagerError> {
    let mut db: diesel::r2d2::PooledConnection<
        diesel::r2d2::ConnectionManager<diesel::PgConnection>,
    > = pool.get()?;
    let progress_data = producer_services::get_producer_progress_data(&mut db, producer_id).await?;

    Ok(Json::from(progress_data))
}

pub async fn delete_producer(
    State(pool): State<PoolHandle>,
    Path(producer_id): Path<String>,
) -> Result<Json<String>, SMSManagerError> {
    let mut db: diesel::r2d2::PooledConnection<
        diesel::r2d2::ConnectionManager<diesel::PgConnection>,
    > = pool.get()?;
    let success_message = producer_services::delete_producer(&mut db, producer_id).await?;

    Ok(Json::from(success_message))
}
