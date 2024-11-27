import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

interface QueryContextProps {
  children: ReactNode;
}

const AppContextQuery = ({ children }: QueryContextProps) => {
  const queryClient = new QueryClient();
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

export default AppContextQuery;
