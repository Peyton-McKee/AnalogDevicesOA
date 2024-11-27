import { useCreateProducer } from '@/hooks/producer.hooks';
import { useToast } from '@/hooks/use-toast';
import { routes } from '@/utils/routes';
import { ProducerArgs } from '@/utils/types';
import { CircularProgress } from '@mui/material';
import ProducerForm from './ProducerForm';
import { useNavigate } from 'react-router-dom';

const CreateProducerForm = () => {
  const { mutateAsync, isPending } = useCreateProducer();
  const { toast } = useToast();
  const navigate = useNavigate();

  if (isPending) {
    return <CircularProgress />;
  }

  const defaultValues: ProducerArgs = {
    name: '',
    number_messages: 1000,
    average_send_delay: 5,
    num_senders: undefined,
    failure_rate: 10
  };

  const onSubmit = async (payload: ProducerArgs) => {
    try {
      await mutateAsync(payload);
      navigate(routes.PRODUCERS);
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: 'Failed to Create Producer',
          description: error.message
        });
      }
    }
  };

  return <ProducerForm title="Create Producer" defaultValues={defaultValues} onSubmit={onSubmit}></ProducerForm>;
};

export default CreateProducerForm;
