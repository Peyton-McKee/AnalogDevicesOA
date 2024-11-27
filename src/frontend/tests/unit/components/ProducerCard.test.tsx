import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProducerCard from '../../../src/components/ProducerCard';
import { routes } from '../../../src/utils/routes';
import { useNavigate, MemoryRouter } from 'react-router-dom';
import React from 'react';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn()
  };
});

describe('ProducerCard Component', () => {
  const mockNavigate = vi.fn();

  const mockProducer = {
    id: 'producer-1',
    name: 'Test Producer',
    number_messages: 100,
    average_send_delay: 5,
    failure_rate: 10,
    num_senders: 4
  };

  beforeEach(() => {
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
  });

  it('renders producer details correctly', () => {
    render(
      <MemoryRouter>
        <ProducerCard producer={mockProducer} />
      </MemoryRouter>
    );

    // Check for producer name
    expect(screen.getByText('Test Producer')).toBeInTheDocument();

    // Check for producer properties
    expect(screen.getByText('Creates 100 messages')).toBeInTheDocument();
    expect(screen.getByText('Senders take 5 seconds on average to send message')).toBeInTheDocument();
    expect(screen.getByText('Senders fail 10% of the time')).toBeInTheDocument();
    expect(screen.getByText('Will use 4 threads to send')).toBeInTheDocument();
  });

  it('navigates to the producer detail page when button is clicked', () => {
    render(
      <MemoryRouter>
        <ProducerCard producer={mockProducer} />
      </MemoryRouter>
    );

    const button = screen.getByRole('button', { name: /show producer/i });
    fireEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith(routes.PRODUCER_BY_ID_NAVIGATE(mockProducer.id));
  });
});
