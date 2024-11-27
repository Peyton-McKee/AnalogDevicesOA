use axum::{
    http::{header::CONTENT_TYPE, HeaderValue, Method},
    Router,
};
use backend::{routes::producer_routes::get_producer_router, PoolHandle};
use diesel::{
    r2d2::{ConnectionManager, Pool},
    PgConnection,
};
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};
use dotenvy::dotenv;
use tower_http::cors::CorsLayer;

const MIGRATIONS: EmbeddedMigrations = embed_migrations!("./src/diesel/migrations");

#[tokio::main]
async fn main() {
    println!("Initializing database connections...");
    dotenv().ok();
    let manager = ConnectionManager::<PgConnection>::new(std::env::var("DATABASE_URL").unwrap());
    let db: PoolHandle = Pool::builder()
        .test_on_check_out(true)
        .build(manager)
        .expect("Could not build connection pool");
    let mut conn = db.get().unwrap();
    conn.run_pending_migrations(MIGRATIONS)
        .expect("Could not run migrations!");
    println!("Successfully migrated DB!");

    let app = Router::new()
        .nest("/producers", get_producer_router())
        .layer(
            CorsLayer::new()
                .allow_methods([Method::GET, Method::POST])
                .allow_origin(
                    std::env::var("ORIGIN_URL")
                        .unwrap_or("http://localhost:5173".to_string())
                        .parse::<HeaderValue>()
                        .unwrap(),
                )
                .allow_headers([CONTENT_TYPE]),
        )
        .with_state(db.clone());

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
