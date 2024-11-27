import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getAllProducers,
  getProducerById,
  activateProducer,
  generateMessages,
  createProducer,
  updateProducer,
  getProducerProgress,
  deleteProducer
} from '../../../src/api/producer.api';
import { getAnalogFetchSpy } from '../test-utils';
import { ProducerArgs } from '../../../src/utils/types';

vi.mock('../../../src/api/fetch');

describe('producerService', () => {
  let fetchSpy;
  const expectedValue = { someKey: 'someValue' };
  const baseUrl = 'http://localhost:8080';

  beforeEach(() => {
    fetchSpy = getAnalogFetchSpy(expectedValue);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should call analogFetch with the correct URL for getAllProducers', async () => {
    const result = await getAllProducers();
    expect(result).toStrictEqual(expectedValue);
    expect(fetchSpy).toHaveBeenCalledWith(baseUrl + '/producers');
  });

  it('should call analogFetch with the correct URL for getProducerById', async () => {
    const id = '123';
    const result = await getProducerById(id);

    expect(result).toStrictEqual(expectedValue);
    expect(fetchSpy).toHaveBeenCalledWith(baseUrl + '/producers/123');
  });

  it('should call analogFetch with the correct URL and options for activateProducer', async () => {
    const id = '123';
    const result = await activateProducer(id);

    expect(result).toStrictEqual(expectedValue);
    expect(fetchSpy).toHaveBeenCalledWith(baseUrl + '/producers/123/send', {
      method: 'POST'
    });
  });

  it('should call analogFetch with the correct URL and options for generateMessages', async () => {
    const producerId = '123';
    const result = await generateMessages(producerId);

    expect(result).toStrictEqual(expectedValue);
    expect(fetchSpy).toHaveBeenCalledWith(baseUrl + '/producers/123/generate', {
      method: 'POST'
    });
  });

  it('should call analogFetch with the correct URL and options for createProducer', async () => {
    const payload: ProducerArgs = {
      name: 'Test Producer',
      number_messages: 10,
      num_senders: 4,
      average_send_delay: 5,
      failure_rate: 10
    };
    const result = await createProducer(payload);

    expect(result).toStrictEqual(expectedValue);
    expect(fetchSpy).toHaveBeenCalledWith(baseUrl + '/producers/create', {
      body: payload,
      method: 'POST'
    });
  });

  it('should call analogFetch with the correct URL and options for updateProducer', async () => {
    const id = '123';
    const payload: ProducerArgs = {
      name: 'Test Producer',
      number_messages: 10,
      num_senders: 4,
      average_send_delay: 5,
      failure_rate: 10
    };

    const result = await updateProducer(id, payload);

    expect(result).toStrictEqual(expectedValue);
    expect(fetchSpy).toHaveBeenCalledWith(baseUrl + '/producers/123/update', {
      body: payload,
      method: 'POST'
    });
  });

  it('should call analogFetch with the correct URL for getProducerProgress', async () => {
    const id = '123';
    const result = await getProducerProgress(id);

    expect(result).toStrictEqual(expectedValue);
    expect(fetchSpy).toHaveBeenCalledWith(baseUrl + '/producers/123/progress');
  });

  it('should call analogFetch with the correct URL and options for deleteProducer', async () => {
    const id = '123';
    const result = await deleteProducer(id);

    expect(result).toStrictEqual(expectedValue);
    expect(fetchSpy).toHaveBeenCalledWith(baseUrl + '/producers/123/delete', {
      method: 'POST'
    });
  });
});
