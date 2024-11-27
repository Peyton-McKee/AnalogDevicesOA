import { Producer, ProducerArgs, ProgressData } from '../utils/types';
import urls from '../utils/urls';
import { analogFetch } from './fetch';

/**
 * Fetches all producers
 */
export const getAllProducers = async () => {
  return await analogFetch<Producer[]>(urls.ALL_PRODUCERS());
};

/**
 *
 * @param id
 * @returns
 */
export const getProducerById = async (id: string) => {
  return await analogFetch<Producer>(urls.PRODUCER_BY_ID(id));
};

/**
 *
 * @param id
 * @returns
 */
export const activateProducer = async (id: string) => {
  return await analogFetch<string>(urls.ACTIVATE_PRODUCER(id), {
    method: 'POST'
  });
};

/**
 *
 * @param producerId
 * @returns
 */
export const generateMessages = async (producerId: string) => {
  return await analogFetch<number>(urls.GENERATE_MESSAGES(producerId), {
    method: 'POST'
  });
};

/**
 *
 * @param payload
 * @returns
 */
export const createProducer = async (payload: ProducerArgs) => {
  return await analogFetch<Producer>(urls.CREATE_PRODUCER(), {
    body: payload,
    method: 'POST'
  });
};

/**
 *
 * @param id
 * @param payload
 * @returns
 */
export const updateProducer = async (id: string, payload: ProducerArgs) => {
  return await analogFetch<Producer>(urls.UPDATE_PRODUCER(id), {
    body: payload,
    method: 'POST'
  });
};

/**
 *
 * @param id
 * @returns
 */
export const getProducerProgress = async (id: string) => {
  return await analogFetch<ProgressData>(urls.PRODUCER_PROGRESS(id));
};

/**
 * 
 * @param id 
 * @returns 
 */
export const deleteProducer = async (id: string) => {
  return await analogFetch<string>(urls.DELETE_PRODUCER(id), { method: 'POST' });
};
