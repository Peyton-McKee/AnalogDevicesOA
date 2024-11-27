import CreateProducerForm from '@/pages/ProducerForm/CreateProducerForm';
import ProducersDashboard from '@/pages/ProducersDashboard/ProducersDashboard';
import UpdateProducerForm from '@/pages/ProducerForm/UpdateProducerForm';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { routes } from '../utils/routes';
import AppContextQuery from './AppContextQuery';
import { Box, Typography } from '@mui/material';
import { PhoneIcon } from 'lucide-react';
import ProducerPage from '@/pages/ProducerPage/ProducerPage';

function App() {
  const navigate = useNavigate();
  return (
    <AppContextQuery>
      <div onClick={() => navigate(routes.PRODUCERS)}>
        <Box
          sx={{
            ':hover': {
              cursor: 'pointer'
            }
          }}
          mt={5}
          ml={5}
          display={'flex'}
          alignItems={'center'}
        >
          <PhoneIcon />
          <Typography ml={2} variant="h5" fontStyle={'bold'}>
            SMS Manager
          </Typography>
        </Box>
      </div>
      <Box sx={{ height: '100vh', marginTop: 3, marginX: 5 }}>
        <Routes>
          <Route path={routes.PRODUCERS} Component={ProducersDashboard} />
          <Route path={routes.PRODUCERS_CREATE} Component={CreateProducerForm} />
          <Route path={routes.PRODUCERS_UPDATE} Component={UpdateProducerForm} />
          <Route path={routes.PRODUCER_BY_ID} Component={ProducerPage} />
          <Route path="*" element={<Navigate to={routes.PRODUCERS} />} />
        </Routes>
      </Box>
    </AppContextQuery>
  );
}

export default App;
