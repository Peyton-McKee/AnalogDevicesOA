use backend::utils::random_utils::{generate_random_string, get_random_wait_time, random_chance};

/// Test for `random_chance`
#[tokio::test]
async fn test_random_chance() {
    // Ensure invalid percentages default to 50%
    let mut true_count = 0;
    let trials = 1000;

    for _ in 0..trials {
        if random_chance(-10) {
            true_count += 1;
        }
    }
    assert!(
        (400..600).contains(&true_count),
        "random_chance(-10) should default to ~50% true rate"
    );

    true_count = 0;
    for _ in 0..trials {
        if random_chance(150) {
            true_count += 1;
        }
    }
    assert!(
        (400..600).contains(&true_count),
        "random_chance(150) should default to ~50% true rate"
    );

    // Test 100% chance
    for _ in 0..100 {
        assert!(
            random_chance(100),
            "random_chance(100) should always return true"
        );
    }

    // Test 0% chance
    for _ in 0..100 {
        assert!(
            !random_chance(0),
            "random_chance(0) should always return false"
        );
    }
}

/// Test for `generate_random_string`
#[tokio::test]
async fn test_generate_random_string() {
    for _ in 0..100 {
        let generated = generate_random_string();
        assert!(
            generated.len() <= 100,
            "Generated string length should not exceed 100"
        );
        assert!(
            generated.chars().all(|c| c.is_alphanumeric()),
            "Generated string should only contain alphanumeric characters"
        );
    }
}

/// Test for `get_random_wait_time`
#[tokio::test]
async fn test_get_random_wait_time() {
    let average = 10;
    let trials = 1000;
    for _ in 0..trials {
        let wait_time = get_random_wait_time(&average);
        assert!(
            (5..=15).contains(&wait_time),
            "Wait time should be within 5 of the average"
        );
    }
}
