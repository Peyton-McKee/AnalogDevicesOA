import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, vi, beforeEach, expect, afterEach } from 'vitest';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import ProducersDashboard from '../../../../src/pages/ProducersDashboard/ProducersDashboard';
import React from 'react';
import { mockProducerQuery } from '../../test-utils';
import { aProducer } from '../../test-data';
vi.mock('@/hooks/producer.hooks');

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn()
  };
});

describe('ProducersDashboard Component', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    mockProducerQuery('useGetAllProducers', [aProducer]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading spinner when data is pending', () => {
    mockProducerQuery('useGetAllProducers', undefined, true);

    render(
      <MemoryRouter>
        <ProducersDashboard />
      </MemoryRouter>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument(); // CircularProgress
  });

  it('shows error page when there is an error', () => {
    const mockError = new Error('Something went wrong');
    mockProducerQuery('useGetAllProducers', undefined, false, true, mockError);

    render(
      <MemoryRouter>
        <ProducersDashboard />
      </MemoryRouter>
    );

    expect(screen.getByText('Oops something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('shows "No Producers Found" when data is empty', async () => {
    mockProducerQuery('useGetAllProducers', []);

    render(
      <MemoryRouter>
        <ProducersDashboard />
      </MemoryRouter>
    );

    // Expect to see the "No Producers Found" message
    expect(screen.getByText('No Producers Found')).toBeInTheDocument();
  });

  it('renders a list of producers when data is available', async () => {
    render(
      <MemoryRouter>
        <ProducersDashboard />
      </MemoryRouter>
    );

    expect(screen.getByText('aName')).toBeInTheDocument();
  });

  it('navigates to the Add Producer page when "Add Producer" button is clicked', async () => {
    render(
      <MemoryRouter>
        <ProducersDashboard />
      </MemoryRouter>
    );

    const addButton = screen.getByRole('button', { name: /Add Producer/i });
    fireEvent.click(addButton);

    expect(mockNavigate).toHaveBeenCalledWith('/producers/create');
  });
});
