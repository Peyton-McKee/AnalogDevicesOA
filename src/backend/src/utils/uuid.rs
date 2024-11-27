use uuid::Uuid;

use super::error::SMSManagerError;

/// Attempts to parse a given string into a uuid
///
/// # Parameters
/// - val: The string to transform to uuid
///
/// # Errors if the value is not a valid uuid
pub fn parse_uuid(val: &str) -> Result<Uuid, SMSManagerError> {
    Uuid::parse_str(val)
        .map_err(|_err| SMSManagerError::InvalidEncoding("Producer Id Is Invalid".to_string()))
}
