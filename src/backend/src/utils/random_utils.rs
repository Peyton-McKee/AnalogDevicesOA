use rand::{distributions::Alphanumeric, Rng};
use tracing::info;

/**
 *
 */
pub fn random_chance(mut percentage: i32) -> bool {
    if percentage < 0 || percentage > 100 {
        info!("Percentage out of bounds, setting to 50");
        percentage = 50;
    }

    let mut rng = rand::thread_rng();
    rng.gen_range(0..100) > percentage
}

/**
 *
 */
pub fn generate_random_string() -> String {
    let length = rand::thread_rng().gen_range(0..=100);
    rand::thread_rng()
        .sample_iter(&Alphanumeric)
        .take(length)
        .map(char::from)
        .collect()
}

/**
 *
 */
pub fn get_random_wait_time(average: &i32) -> u64 {
    let random_change = rand::thread_rng().gen_range(0..=100);
    let random_sign = rand::thread_rng().gen_range(-1..=1);
    let mut wait_time = average + (random_sign * random_change);
    if wait_time < 0 {
        wait_time = *average;
    }

    wait_time as u64
}
