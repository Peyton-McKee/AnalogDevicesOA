import ErrorPage from '@/components/ErrorPage';
import { useGetProducerById, useUpdateProducer } from '@/hooks/producer.hooks';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import { ProducerArgs } from '@/utils/types';
import { routes } from '@/utils/routes';
import ProducerForm from './ProducerForm';

const UpdateProducerForm = () => {
  const { producerId } = useParams();
  const { mutateAsync, isPending: updateIsPending } = useUpdateProducer(producerId ?? '');
  const { toast } = useToast();
  const { data: producer, isPending, isError, error } = useGetProducerById(producerId ?? '');
  const navigate = useNavigate();

  if (isError) {
    return <ErrorPage error={error} />;
  }
  if (isPending || updateIsPending || !producer) {
    return <CircularProgress />;
  }

  const defaultValues: ProducerArgs = {
    name: producer.name,
    number_messages: producer.number_messages,
    average_send_delay: producer.average_send_delay,
    num_senders: producer.num_senders ?? undefined,
    failure_rate: producer.failure_rate
  };

  const onSubmit = async (payload: ProducerArgs) => {
    try {
      await mutateAsync(payload);
      navigate(producerId ? routes.PRODUCER_BY_ID_NAVIGATE(producerId) : routes.PRODUCERS);
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: 'Failed to Update Producer',
          description: error.message
        });
      }
    }
  };

  return (
    <ProducerForm title={'Update Producer' + producer.name} defaultValues={defaultValues} onSubmit={onSubmit}></ProducerForm>
  );
};

export default UpdateProducerForm;
