const BASE = `/`;

/**************** Producers Section ****************/
const PRODUCERS = '/producers';
const PRODUCERS_CREATE = '/producers/create';
const PRODUCERS_UPDATE = '/producers/:producerId/update';
const PRODUCER_BY_ID = '/producers/:producerId';

const PRODUCER_BY_ID_NAVIGATE = (id: string) => `/producers/${id}`;

export const routes = {
  BASE,

  PRODUCERS,
  PRODUCERS_CREATE,
  PRODUCERS_UPDATE,
  PRODUCER_BY_ID,

  PRODUCER_BY_ID_NAVIGATE
};
