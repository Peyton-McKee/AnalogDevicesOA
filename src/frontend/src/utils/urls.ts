const API_URL: string = import.meta.env.BACKEND_URL || 'http://localhost:8080';

/**************** Producers Endpoints ****************/
const PRODUCERS = () => API_URL + '/producers';
const ALL_PRODUCERS = () => `${PRODUCERS()}`;
const CREATE_PRODUCER = () => `${PRODUCERS()}/create`;
const PRODUCER_BY_ID = (id: string) => `${PRODUCERS()}/${id}`;
const UPDATE_PRODUCER = (id: string) => `${PRODUCER_BY_ID(id)}/update`;
const ACTIVATE_PRODUCER = (id: string) => `${PRODUCER_BY_ID(id)}/send`;
const GENERATE_MESSAGES = (id: string) => `${PRODUCER_BY_ID(id)}/generate`;
const PRODUCER_PROGRESS = (id: string) => `${PRODUCER_BY_ID(id)}/progress`;
const DELETE_PRODUCER = (id: string) => `${PRODUCER_BY_ID(id)}/delete`;

export default {
  PRODUCERS,
  ALL_PRODUCERS,
  CREATE_PRODUCER,
  PRODUCER_BY_ID,
  UPDATE_PRODUCER,
  ACTIVATE_PRODUCER,
  GENERATE_MESSAGES,
  PRODUCER_PROGRESS,
  DELETE_PRODUCER
};
