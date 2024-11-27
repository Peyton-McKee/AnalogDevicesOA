use ::diesel::{r2d2, PgConnection};

pub mod controllers;
pub mod diesel;
pub mod services;
pub mod transformers;
pub mod utils;
pub mod routes;

/// The type descriptor of the database passed to the middlelayer through axum state
pub type Database = PgConnection;

pub type PoolHandle = r2d2::Pool<r2d2::ConnectionManager<PgConnection>>;
