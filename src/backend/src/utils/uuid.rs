use uuid::Uuid;

use super::error::SMSManagerError;

pub fn parse_uuid(val: &String) -> Result<Uuid, SMSManagerError> {
    Uuid::parse_str(&val)
        .map_err(|_err| SMSManagerError::InvalidEncoding("Producer Id Is Invalid".to_string()))
}
