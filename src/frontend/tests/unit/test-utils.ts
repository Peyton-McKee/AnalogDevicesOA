import { vi } from 'vitest';
import * as Fetch from '../../src/api/fetch';
import * as ProducerHooks from '../../src/hooks/producer.hooks';
import * as ProducerApis from '../../src/api/producer.api';

import { Producer, ProgressData } from '../../src/utils/types';

export const getMockFetch = (response: object, status: boolean = true) => {
  return vi.fn(() =>
    Promise.resolve({
      ok: status,
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(response)
    })
  );
};

export const getAnalogFetchSpy = (response: object) => {
  const spy = vi.spyOn(Fetch, 'analogFetch').mockResolvedValue(response);
  return spy;
};

export type ProducerApiName =
  | 'getAllProducers'
  | 'getProducerById'
  | 'activateProducer'
  | 'generateMessages'
  | 'createProducer'
  | 'updateProducer'
  | 'getProducerProgress'
  | 'deleteProducer';

export const mockProducerApiCall = (functionName: ProducerApiName, response: Producer[] | Producer | string | number) => {
  const spy = vi.spyOn(ProducerApis, functionName).mockResolvedValue(response);
  return spy;
};

export type ProducerHookName =
  | 'useGetAllProducers'
  | 'useCreateProducer'
  | 'useUpdateProducer'
  | 'useGenerateMessages'
  | 'useActivateProducer'
  | 'useGetProducerProgress'
  | 'useDeleteProducer'
  | 'useGetProducerById';

export const mockProducerQuery = (
  functionName: ProducerHookName,
  returnValue: Producer | Producer[] | ProgressData | string | number | undefined,
  isPending: boolean = false,
  isError: boolean = false,
  error: Error | null = null,
  refetch = vi.fn()
) => {
  const spy = vi
    .spyOn(ProducerHooks, functionName)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .mockReturnValue({ data: returnValue, isPending, isError, error, refetch } as any);
  return spy;
};

export const mockProducerMutation = (
  functionName: ProducerHookName,
  returnValue: Producer | Producer[] | string | number | undefined,
  isPending: boolean = false,
  error: Error | null = null
) => {
  const mutation = vi.fn().mockImplementation(() => {
    if (error) {
      throw error;
    }
    return returnValue;
  });
  vi.spyOn(ProducerHooks, functionName)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .mockReturnValue({ mutateAsync: mutation, isPending } as any);
  return mutation;
};

export const createTestProducer = ({
  id = 'aProducerId',
  status = 'aStatus',
  name = 'aName',
  number_messages = 10,
  num_senders = 4,
  average_send_delay = 5,
  failure_rate = 20
}: {
  id?: string;
  status?: string;
  name?: string;
  number_messages?: number;
  num_senders?: number;
  average_send_delay?: number;
  failure_rate?: number;
} = {}): Producer => {
  return {
    id,
    status,
    name,
    number_messages,
    num_senders,
    average_send_delay,
    failure_rate
  };
};
