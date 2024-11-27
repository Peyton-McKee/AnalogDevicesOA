use backend::{
    diesel::schema::{messages, producers}, PoolHandle,
};
use diesel::{prelude::*, r2d2::{ConnectionManager, Pool}};
use dotenvy::dotenv;

pub async fn cleanup_and_prepare() -> Result<PoolHandle, diesel::result::Error> {
    dotenv().ok();

    let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let manager = ConnectionManager::<PgConnection>::new(database_url);
    let db: PoolHandle = Pool::builder()
        .test_on_check_out(true)
        .build(manager)
        .expect("Could not build connection pool");

    let mut client = db.get().unwrap();

    diesel::delete(messages::table).execute(&mut client)?;
    diesel::delete(producers::table).execute(&mut client)?;

    Ok(db.clone())
}
