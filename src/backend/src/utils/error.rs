use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
};
use tracing::warn;

pub enum SMSManagerError {
    /// Deseil error
    DbError(diesel::result::Error),
    /// Diesel db connection error,
    ConnError(diesel::r2d2::PoolError),
    /// An instruction was not encodable
    InvalidEncoding(String),
    /// General Exception
    GeneralException(String),
    /// A query turned up empty that should not have
    EmptyResult,
}

impl From<diesel::result::Error> for SMSManagerError {
    fn from(error: diesel::result::Error) -> Self {
        SMSManagerError::DbError(error)
    }
}

impl From<diesel::r2d2::PoolError> for SMSManagerError {
    fn from(error: diesel::r2d2::PoolError) -> Self {
        SMSManagerError::ConnError(error)
    }
}

// This centralizes all different errors from our app in one place
impl IntoResponse for SMSManagerError {
    fn into_response(self) -> Response {
        let (status, reason) = match self {
            SMSManagerError::ConnError(error) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Could not connect to db: {}", error),
            ),
            SMSManagerError::DbError(error) => (
                StatusCode::BAD_REQUEST,
                format!("Misc query error: {}", error),
            ),
            SMSManagerError::InvalidEncoding(reason) => (StatusCode::UNPROCESSABLE_ENTITY, reason),
            SMSManagerError::GeneralException(error) => {
                (StatusCode::INTERNAL_SERVER_ERROR, format!("{}", error))
            }
            SMSManagerError::EmptyResult => (
                StatusCode::NOT_FOUND,
                "Fetched an empty result that should not be!".to_string(),
            ),
        };

        warn!("Routing error: {}: {}", status, reason);

        (status, reason).into_response()
    }
}
