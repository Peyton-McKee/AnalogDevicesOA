import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { ProducerArgs } from '../../utils/types';
import { yupResolver } from '@hookform/resolvers/yup';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Container, Typography } from '@mui/material';

interface ProducerFormProps {
  onSubmit: (payload: ProducerArgs) => void;
  defaultValues: ProducerArgs;
  title: string;
}

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  number_messages: yup.number().required('Number of messages is required'),
  average_send_delay: yup.number().required('Average send delay is required'),
  failure_rate: yup.number().required('Failure rate is required'),
  num_senders: yup.number().optional()
});

const ProducerForm = ({ onSubmit, defaultValues, title }: ProducerFormProps) => {
  const form = useForm<ProducerArgs>({
    defaultValues,
    resolver: yupResolver(schema)
  });

  return (
    <Container>
      <Typography variant="h3" fontWeight={'bold'}>
        {title}
      </Typography>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name={'name'}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Producer Name" {...field} />
                </FormControl>
                <FormDescription>Human readable name for the producer</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={'number_messages'}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Messages</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="1000" {...field} />
                </FormControl>
                <FormDescription>Number of messages that this producer will create</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={'average_send_delay'}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Average Send Delay</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="5" {...field} />
                </FormControl>
                <FormDescription>
                  Number of seconds that it will take for a sms message to be sent on average
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={'failure_rate'}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Failure Rate</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="10%" {...field} />
                </FormControl>
                <FormDescription>The rate at which sending an sms message should fail</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={'num_senders'}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Num Senders</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Number of Available Threads" {...field} />
                </FormControl>
                <FormDescription>
                  The number of senders that will process the messages, defaults to maximum number of available threads
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button style={{ marginTop: 10 }} type="submit">
            Submit
          </Button>
        </form>
      </Form>
    </Container>
  );
};

export default ProducerForm;
