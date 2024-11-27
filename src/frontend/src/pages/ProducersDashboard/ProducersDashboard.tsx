import ErrorPage from '@/components/ErrorPage';
import ProducerCard from '@/components/ProducerCard';
import { Button } from '@/components/ui/button';
import { useGetAllProducers } from '@/hooks/producer.hooks';
import { routes } from '@/utils/routes';
import { CircularProgress, Box, Grid2, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ProducersDashboard = () => {
  const { data, isPending, isError, error } = useGetAllProducers();
  const navigate = useNavigate();

  if (isError) {
    return <ErrorPage error={error} />;
  }
  if (isPending || !data) {
    return <CircularProgress />;
  }

  return (
    <Box>
      <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'} mb={1}>
        <Typography variant="h3" fontStyle={'bold'}>
          Producers
        </Typography>
        <Button onClick={() => navigate(routes.PRODUCERS_CREATE)}>Add Producer</Button>
      </Box>
      <Grid2 container spacing={1}>
        {data.length === 0 && <Typography>No Producers Found</Typography>}
        {data.map((producer) => (
          <ProducerCard producer={producer} />
        ))}
      </Grid2>
    </Box>
  );
};

export default ProducersDashboard;
