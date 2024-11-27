import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { routes } from '../../../src/utils/routes';
import App from '../../../src/app/App';

vi.mock('@/pages/ProducerForm/CreateProducerForm', () => ({
  default: () => <div>Create Producer Form</div>
}));

vi.mock('@/pages/ProducerForm/UpdateProducerForm', () => ({
  default: () => <div>Update Producer Form</div>
}));

vi.mock('@/pages/ProducersDashboard/ProducersDashboard', () => ({
  default: () => <div>Producers Dashboard</div>
}));

vi.mock('@/pages/ProducerPage/ProducerPage', () => ({
  default: () => <div>Producer Page</div>
}));

describe('App Component', () => {
  it('renders the header with "SMS Manager"', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText(/SMS Manager/i)).toBeInTheDocument();
  });

  it('navigates to ProducersDashboard when clicking on the header', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    const header = screen.getByText(/SMS Manager/i);
    fireEvent.click(header);

    expect(screen.getByText(/Producers Dashboard/i)).toBeInTheDocument();
  });

  it('renders ProducersDashboard for /producers route', () => {
    render(
      <MemoryRouter initialEntries={[routes.PRODUCERS]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText(/Producers Dashboard/i)).toBeInTheDocument();
  });

  it('renders CreateProducerForm for /producers/create route', () => {
    render(
      <MemoryRouter initialEntries={[routes.PRODUCERS_CREATE]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText(/Create Producer Form/i)).toBeInTheDocument();
  });

  it('renders UpdateProducerForm for /producers/update route', () => {
    render(
      <MemoryRouter initialEntries={[routes.PRODUCERS_UPDATE]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText(/Update Producer Form/i)).toBeInTheDocument();
  });

  it('renders ProducerPage for /producers/:id route', () => {
    const producerId = '123';
    render(
      <MemoryRouter initialEntries={[routes.PRODUCER_BY_ID_NAVIGATE(producerId)]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText(/Producer Page/i)).toBeInTheDocument();
  });

  it('redirects to ProducersDashboard for an invalid route', () => {
    render(
      <MemoryRouter initialEntries={['/invalid-route']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText(/Producers Dashboard/i)).toBeInTheDocument();
  });
});
