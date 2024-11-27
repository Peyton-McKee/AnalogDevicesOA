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
 * Fetches the producer with the provided id from the backend
 *
 * @param id The id of the producer to retrieve
 * @returns The retrieved producer
 */
export const getProducerById = async (id: string) => {
  return await analogFetch<Producer>(urls.PRODUCER_BY_ID(id));
};

/**
 * Sends the pending messages of the producer with the given id
 *
 * @param id The id of the producer to activate
 * @returns A success message
 */
export const activateProducer = async (id: string) => {
  return await analogFetch<string>(urls.ACTIVATE_PRODUCER(id), {
    method: 'POST'
  });
};

/**
 * Generates the number of messages specified by the producer with the given id
 *
 * @param producerId The id of the producer to generate the messages for
 * @returns The number of generated messages
 */
export const generateMessages = async (producerId: string) => {
  return await analogFetch<number>(urls.GENERATE_MESSAGES(producerId), {
    method: 'POST'
  });
};

/**
 * Creates a producer with the provided configuration
 *
 * @param payload The values to create the producer with
 * @returns The created producer
 */
export const createProducer = async (payload: ProducerArgs) => {
  return await analogFetch<Producer>(urls.CREATE_PRODUCER(), {
    body: payload,
    method: 'POST'
  });
};

/**
 * Updates the producer with the given id to have the provided configuration
 *
 * @param id The id of the producer to update
 * @param payload The new configuration to apply to the producer
 * @returns The updated producer
 */
export const updateProducer = async (id: string, payload: ProducerArgs) => {
  return await analogFetch<Producer>(urls.UPDATE_PRODUCER(id), {
    body: payload,
    method: 'POST'
  });
};

/**
 * Gets the progress of the producer with the given id
 *
 * @param id The id of the producer to get the progress for
 * @returns The progress of the producer
 */
export const getProducerProgress = async (id: string) => {
  return await analogFetch<ProgressData>(urls.PRODUCER_PROGRESS(id));
};

/**
 * Deletes the producer with the given id
 *
 * @param id The id of the producer to delete
 * @returns A success message
 */
export const deleteProducer = async (id: string) => {
  return await analogFetch<string>(urls.DELETE_PRODUCER(id), { method: 'POST' });
};
