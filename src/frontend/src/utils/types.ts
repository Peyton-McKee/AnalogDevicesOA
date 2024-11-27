export interface ProducerArgs {
  name: string;
  number_messages: number;
  average_send_delay: number;
  failure_rate: number;
  num_senders?: number;
}

export interface Producer extends ProducerArgs {
  id: string;
  status: string;
}

export interface ProgressData {
  number_messages_created: number;
  number_messages_sent: number;
  number_messages_failed: number;
  average_message_time: number;
  message_times: number[];
}
