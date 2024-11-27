import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  activateProducer,
  createProducer,
  deleteProducer,
  generateMessages,
  getAllProducers,
  getProducerById,
  getProducerProgress,
  updateProducer
} from '../api/producer.api';
import { Producer, ProducerArgs, ProgressData } from '../utils/types';

/**
 * Custom react hook to get all the producers from the backend
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
 * Custom react hook to get the producer with the given id
 *
 * @param id The id of the producer to retrieve
 * @returns React query useQuery object
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
 * Custom react hook to activate the producer with the given id
 * Invalidates the producer and producerProgress queries on success
 *
 * @param id The id of the producer to activate
 * @returns Mutation object to activate the producer
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
 * Custom react hook to generate messages for the producer with the given id
 * Invalidates the producer and producerProgress queries on success
 *
 * @param id The id of the producer to generate the messages for
 * @returns Mutation object to generate the messages
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
 * Custom react hook to create a producer
 * Invalidates the allProducers query on success
 *
 * @returns Mutation function to create a producer
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
 * Custom react hook to update a producer
 * Invalidates the producer and producer progress queries
 *
 * @param id The id of the producer to update
 * @returns Mutation function to update the producer
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
 * Custom react hook to get the progress of a producer
 *
 * @param id The id of the producer to get the progress for
 * @returns Query function to manage the state of the request
 */
export const useGetProducerProgress = (id: string) => {
  return useQuery<ProgressData, Error>({
    queryKey: ['producers', 'progress', id],
    queryFn: async () => {
      return await getProducerProgress(id);
    }
  });
};

/**
 * Custom react hook to delete a producer
 * Invalidates the allProducers query
 *
 * @param id The id of the producer to delete
 * @returns A mutation function to delete the producer
 */
export const useDeleteProducer = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<string, Error>({
    mutationFn: async () => {
      return await deleteProducer(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['producers'] });
    }
  });
};
