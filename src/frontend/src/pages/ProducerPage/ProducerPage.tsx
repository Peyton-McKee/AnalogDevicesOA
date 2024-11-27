import ErrorPage from '@/components/ErrorPage';
import MessageBreakdown from '@/components/MessageBreakdown';
import { useGetProducerById, useGetProducerProgress } from '@/hooks/producer.hooks';
import { Box, CircularProgress, Grid2, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import ProducerActions from './ProducerActions';
import { useEffect, useState } from 'react';
import MessageDurationDistribution from '@/components/MessageDurationDistribution';

const ProducerPage = () => {
  const { producerId } = useParams();
  const [refreshRate, setRefreshRate] = useState(parseFloat(localStorage.getItem('refreshRate') ?? '5'));

  const { data: producer, isPending, isError, error, refetch } = useGetProducerById(producerId ?? '');
  const {
    data: producerProgress,
    isPending: producerProgressIsPending,
    isError: producerProgressIsError,
    error: producerProgressError,
    refetch: producerProgressRefetch
  } = useGetProducerProgress(producerId ?? '');

  useEffect(() => {
    const intervalId = setInterval(() => {
      producerProgressRefetch();
      refetch();
    }, refreshRate * 1000);

    return () => clearInterval(intervalId);
  }, [refreshRate, producerProgressRefetch, refetch]);

  if (isError) {
    return <ErrorPage error={error} />;
  }
  if (producerProgressIsError) {
    return <ErrorPage error={producerProgressError} />;
  }
  if (!producer || !producerProgress || isPending || producerProgressIsPending) {
    return <CircularProgress />;
  }

  return (
    <Box>
      <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'} marginBottom={5}>
        <Typography variant="h3" fontStyle={'bold'}>
          {producer.name} - {producer.status}
        </Typography>
        <ProducerActions
          producer={producer}
          onRefreshRateChanged={(rate) => {
            localStorage.setItem('refreshRate', rate.toString());
            setRefreshRate(rate);
          }}
        />
      </Box>

      <Grid2 container spacing={2}>
        <MessageBreakdown
          numberFailed={producerProgress.number_messages_failed}
          numberSent={producerProgress.number_messages_sent}
          totalMessages={producerProgress.number_messages_created}
        />
        <MessageDurationDistribution messageTimes={producerProgress.message_times} />
      </Grid2>
    </Box>
  );
};

export default ProducerPage;
