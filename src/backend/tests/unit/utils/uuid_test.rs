
use backend::utils::{error::SMSManagerError, uuid::parse_uuid};
use uuid::Uuid;

#[tokio::test]
async fn test_parse_uuid_valid() {
    // Test a valid UUID
    let valid_uuid = Uuid::new_v4().to_string();
    let result = parse_uuid(&valid_uuid);

    assert!(
        result.is_ok(),
        "parse_uuid should return Ok for valid UUID strings"
    );
    assert_eq!(
        result.unwrap().to_string(),
        valid_uuid,
        "parse_uuid should correctly parse a valid UUID"
    );
}

#[tokio::test]
async fn test_parse_uuid_invalid() {
    // Test an invalid UUID
    let invalid_uuid = "not-a-uuid";
    let result = parse_uuid(invalid_uuid);

    assert!(
        result.is_err(),
        "parse_uuid should return Err for invalid UUID strings"
    );

    if let Err(err) = result {
        match err {
            SMSManagerError::InvalidEncoding(message) => {
                assert_eq!(
                    message,
                    "Producer Id Is Invalid",
                    "Error message should match expected text"
                );
            }
            _ => panic!("Unexpected error type"),
        }
    }
}

#[tokio::test]
async fn test_parse_uuid_empty_string() {
    // Test an empty string as input
    let empty_string = "";
    let result = parse_uuid(empty_string);

    assert!(
        result.is_err(),
        "parse_uuid should return Err for an empty string"
    );

    if let Err(err) = result {
        match err {
            SMSManagerError::InvalidEncoding(message) => {
                assert_eq!(
                    message,
                    "Producer Id Is Invalid",
                    "Error message should match expected text"
                );
            }
            _ => panic!("Unexpected error type"),
        }
    }
}

#[tokio::test]
async fn test_parse_uuid_partial_uuid() {
    // Test a partial UUID
    let partial_uuid = "12345";
    let result = parse_uuid(partial_uuid);

    assert!(
        result.is_err(),
        "parse_uuid should return Err for a partial UUID string"
    );

    if let Err(err) = result {
        match err {
            SMSManagerError::InvalidEncoding(message) => {
                assert_eq!(
                    message,
                    "Producer Id Is Invalid",
                    "Error message should match expected text"
                );
            }
            _ => panic!("Unexpected error type"),
        }
    }
}