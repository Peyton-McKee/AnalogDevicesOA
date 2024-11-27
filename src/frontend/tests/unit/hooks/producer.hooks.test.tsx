import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockProducerApiCall } from '../test-utils';
import { aProducer } from '../test-data';
import { renderHook, waitFor } from '@testing-library/react';
import {
  useActivateProducer,
  useCreateProducer,
  useDeleteProducer,
  useGenerateMessages,
  useGetAllProducers,
  useGetProducerById,
  useUpdateProducer
} from '../../../src/hooks/producer.hooks';
import { act } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('../../../src/api/producer.api');

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient();
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe('Custom Producer Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call getAllProducers and return data', async () => {
    mockProducerApiCall('getAllProducers', [aProducer]);

    const { result } = renderHook(() => useGetAllProducers(), { wrapper });

    await waitFor(() => expect(result.current.isPending).toBe(false));
    expect(result.current.data).toEqual([aProducer]);
  });

  it('should call getProducerById and return a single producer', async () => {
    mockProducerApiCall('getProducerById', aProducer);

    const { result } = renderHook(() => useGetProducerById('1'), { wrapper });

    await waitFor(() => expect(result.current.isPending).toBe(false));
    expect(result.current.data).toEqual(aProducer);
  });

  it('should call activateProducer and invalidate relevant queries', async () => {
    const mockActivateResponse = 'Producer activated';
    mockProducerApiCall('activateProducer', mockActivateResponse);

    const { result } = renderHook(() => useActivateProducer('1'), { wrapper });

    await act(async () => {
      await result.current.mutateAsync();
    });

    expect(result.current.isPending).toBe(false);
  });

  it('should call createProducer and return a created producer', async () => {
    mockProducerApiCall('createProducer', aProducer);

    const { result } = renderHook(() => useCreateProducer(), { wrapper });

    await act(async () => {
      const createdProducer = await result.current.mutateAsync(aProducer);
      expect(createdProducer).toEqual(aProducer);
    });
  });

  it('should call updateProducer and return a created producer', async () => {
    mockProducerApiCall('updateProducer', aProducer);

    const { result } = renderHook(() => useUpdateProducer(aProducer.id), { wrapper });

    await act(async () => {
      const updatedProducer = await result.current.mutateAsync(aProducer);
      expect(updatedProducer).toEqual(aProducer);
    });
  });

  it('should call deleteProducer and invalidate queries', async () => {
    const deleteResponse = 'Producer deleted';
    mockProducerApiCall('deleteProducer', deleteResponse);

    const { result } = renderHook(() => useDeleteProducer('1'), { wrapper });

    await act(async () => {
      await result.current.mutateAsync();
    });

    expect(result.current.isPending).toBe(false);
  });

  it('should call generateMessages and invalidate relevant queries', async () => {
    const generateResponse = 100; // Number of messages generated
    mockProducerApiCall('generateMessages', generateResponse);

    const { result } = renderHook(() => useGenerateMessages('1'), { wrapper });

    await act(async () => {
      const generatedMessages = await result.current.mutateAsync();
      expect(generatedMessages).toEqual(generateResponse);
    });
  });
});
