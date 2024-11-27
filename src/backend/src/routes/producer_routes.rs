use axum::{
    routing::{get, post},
    Router,
};

use crate::controllers::producer_controllers::{
    activate_producer, create_producer, generate_messages, get_all_producers, get_producer_by_id,
    get_producer_progress_data, update_producer,
};

pub fn get_producer_router(
) -> Router<diesel::r2d2::Pool<diesel::r2d2::ConnectionManager<diesel::PgConnection>>> {
    Router::new()
        .route("/", get(get_all_producers))
        .route("/create", post(create_producer))
        .route("/:id", get(get_producer_by_id))
        .route("/:id/update", post(update_producer))
        .route("/:id/generate", post(generate_messages))
        .route("/:id/send", post(activate_producer))
        .route("/:id/progress", get(get_producer_progress_data))
}
