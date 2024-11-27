import { Producer } from '@/utils/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Grid2 } from '@mui/material';
import { CircleX, MessageCircleQuestion, Send, Timer } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/utils/routes';
import IconDisplay from './IconDisplay';

interface ProducerCardProps {
  producer: Producer;
}

const ProducerCard = ({ producer }: ProducerCardProps) => {
  const navigate = useNavigate();

  return (
    <Card style={{ maxWidth: 500 }}>
      <CardHeader>
        <CardTitle>{producer.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <Grid2 container spacing={5}>
          <IconDisplay icon={<MessageCircleQuestion />} label={`Creates ${producer.number_messages} messages`} />
          <IconDisplay icon={<Timer />} label={`Senders take ${producer.average_send_delay} seconds on average to send message`} />
          <IconDisplay icon={<CircleX />} label={`Senders fail ${producer.failure_rate}% of the time`} />
          <IconDisplay
            icon={<Send />}
            label={`Will use ${producer.num_senders ?? 'maximum available'} threads to send`}
          />
        </Grid2>
      </CardContent>
      <CardFooter>
        <Button
          onClick={() => {
            navigate(routes.PRODUCER_BY_ID_NAVIGATE(producer.id));
          }}
        >
          Show Producer
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProducerCard;
