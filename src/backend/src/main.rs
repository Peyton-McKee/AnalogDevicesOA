use axum::{
    http::Method,
    routing::{get, post},
    Router,
};
use backend::{
    controllers::producer_controllers::{
        activate_producer, create_producer, generate_messages, get_all_producers,
        get_producer_by_id, update_producer,
    },
    PoolHandle,
};
use diesel::{
    r2d2::{ConnectionManager, Pool},
    PgConnection,
};
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};
use dotenvy::dotenv;
use tower_http::cors::{Any, CorsLayer};
use tracing::info;

const MIGRATIONS: EmbeddedMigrations = embed_migrations!("./src/diesel/migrations");

#[tokio::main]
async fn main() {
    info!("Initializing database connections...");
    dotenv().ok();
    let manager = ConnectionManager::<PgConnection>::new(std::env::var("DATABASE_URL").unwrap());
    let db: PoolHandle = Pool::builder()
        .test_on_check_out(true)
        .build(manager)
        .expect("Could not build connection pool");
    let mut conn = db.get().unwrap();
    conn.run_pending_migrations(MIGRATIONS)
        .expect("Could not run migrations!");
    info!("Successfully migrated DB!");

    let app = Router::new()
        .route("/producers/create", post(create_producer))
        .route("/producers/", get(get_all_producers))
        .route("/producers/:id", get(get_producer_by_id))
        .route("/producers/:id/update", post(update_producer))
        .route("/producers/:id/generate", post(generate_messages))
        .route("/producers/:id/send", post(activate_producer))
        .layer(
            CorsLayer::new()
                // allow `GET`
                .allow_methods([Method::GET, Method::POST])
                // allow requests from any origin
                .allow_origin(Any),
        )
        .with_state(db.clone());

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
