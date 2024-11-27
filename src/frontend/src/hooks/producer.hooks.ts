import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  activateProducer,
  createProducer,
  generateMessages,
  getAllProducers,
  getProducerById,
  getProducerProgress,
  updateProducer
} from '../api/producer.api';
import { Producer, ProducerArgs, ProgressData } from '../utils/types';

/**
 *
 * @returns
 */
export const useGetAllProducers = () => {
  return useQuery<Producer[], Error>({
    queryKey: ['producers'],
    queryFn: async () => {
      return await getAllProducers();
    }
  });
};

/**
 *
 * @param id
 * @returns
 */
export const useGetProducerById = (id: string) => {
  return useQuery<Producer, Error>({
    queryKey: ['producers', id],
    queryFn: async () => {
      return await getProducerById(id);
    }
  });
};

/**
 *
 * @param id
 * @returns
 */
export const useActivateProducer = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<string, Error>({
    mutationFn: async () => {
      return await activateProducer(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['producers', id] });
      queryClient.invalidateQueries({ queryKey: ['producers', 'progress', id] });
    }
  });
};

/**
 *
 * @param id
 * @returns
 */
export const useGenerateMessages = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<number, Error>({
    mutationFn: async () => {
      return await generateMessages(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['producers', id] });
      queryClient.invalidateQueries({ queryKey: ['producers', 'progress', id] });
    }
  });
};

/**
 *
 * @returns
 */
export const useCreateProducer = () => {
  const queryClient = useQueryClient();
  return useMutation<Producer, Error, ProducerArgs>({
    mutationFn: async (payload: ProducerArgs) => {
      return await createProducer(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['producers'] });
    }
  });
};

/**
 *
 * @param id
 * @returns
 */
export const useUpdateProducer = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<Producer, Error, ProducerArgs>({
    mutationFn: async (payload: ProducerArgs) => {
      return await updateProducer(id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['producers', id] });
      queryClient.invalidateQueries({ queryKey: ['producers', 'progress', id] });
    }
  });
};

/**
 *
 * @param id
 * @returns
 */
export const useGetProducerProgress = (id: string) => {
  return useQuery<ProgressData, Error>({
    queryKey: ['producers', 'progress', id],
    queryFn: async () => {
      return await getProducerProgress(id);
    }
  });
};
