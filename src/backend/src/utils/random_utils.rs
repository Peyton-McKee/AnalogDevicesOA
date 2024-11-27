use rand::{distributions::Alphanumeric, Rng};

/// Returns a true or false value at the given percentage to be false
/// If invalid percentage, defaults the percentage to 50
///
/// # Parameters
/// - percentage: The percentage between 0 and 100 to generate the chance from
pub fn random_chance(mut percentage: i32) -> bool {
    if !(0..=100).contains(&percentage) {
        println!("Percentage out of bounds, setting to 50");
        percentage = 50;
    }

    let mut rng = rand::thread_rng();
    rng.gen_range(0..100) < percentage
}

/// Generates a random alphanumeric string between 0 and 100 characters long
pub fn generate_random_string() -> String {
    let length = rand::thread_rng().gen_range(0..=100);
    rand::thread_rng()
        .sample_iter(&Alphanumeric)
        .take(length)
        .map(char::from)
        .collect()
}

/// Gets a random wait time that is between 0 and 5 values away from the given average
/// 
/// # Parameters
/// - average: The average to base the time around
pub fn get_random_wait_time(average: &i32) -> u64 {
    let random_change = rand::thread_rng().gen_range(0..=5);
    let random_sign = rand::thread_rng().gen_range(-1..=1);
    let mut wait_time = average + (random_sign * random_change);
    if wait_time < 0 {
        wait_time = *average;
    }

    wait_time as u64
}
