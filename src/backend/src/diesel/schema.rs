// @generated automatically by Diesel CLI.

diesel::table! {
    message (id) {
        id -> Uuid,
        message_body -> Text,
        sent -> Bool,
        failed -> Bool,
        time_took -> Nullable<Int4>,
        produced_by -> Uuid,
    }
}

diesel::table! {
    producer (id) {
        id -> Uuid,
        name -> Text,
        number_messages -> Int4,
        average_send_delay -> Int4,
        failure_rate -> Int4,
        num_senders -> Nullable<Int4>,
    }
}

diesel::joinable!(message -> producer (produced_by));

diesel::allow_tables_to_appear_in_same_query!(
    message,
    producer,
);
