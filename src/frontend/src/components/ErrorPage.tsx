import { Container, Typography } from '@mui/material';
import { Button } from './ui/button';
import { routes } from '@/utils/routes';
import { useNavigate } from 'react-router-dom';

interface ErrorPageProps {
  error: Error;
}

const ErrorPage = ({ error }: ErrorPageProps) => {
  const navigate = useNavigate();

  const onClick = () => {
    navigate(routes.PRODUCERS);
  };

  return (
    <Container sx={{ textAlign: 'center'}}>
      <Typography mb={1} variant="h2" fontWeight="bold">
        Oops something went wrong
      </Typography>
      <Typography mb={1}>{error.message}</Typography>
      <Button style={{ marginBottom: 1 }} onClick={onClick}>
        Go to Dashboard
      </Button>
    </Container>
  );
};

export default ErrorPage;
