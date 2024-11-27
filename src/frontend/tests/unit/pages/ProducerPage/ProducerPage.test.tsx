import { render, screen, fireEvent } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ProducerPage from '../../../../src/pages/ProducerPage/ProducerPage';
import React from 'react';
import { mockProducerMutation, mockProducerQuery } from '../../test-utils';
import { aProducer } from '../../test-data';
import { ProgressData } from '../../../../src/utils/types';
import { MemoryRouter, useNavigate } from 'react-router-dom';

vi.mock('../../../../src/hooks/producer.hooks');

vi.mock('../../../../src/components/ErrorPage', () => ({
  __esModule: true,
  default: vi.fn().mockReturnValue(<div>Error</div>)
}));

vi.mock('../../../../src/components/MessageBreakdown', () => ({
  __esModule: true,
  default: vi.fn().mockReturnValue(<div>Message Breakdown</div>)
}));

vi.mock('../../../../src/components/MessageDurationDistribution', () => ({
  __esModule: true,
  default: vi.fn().mockReturnValue(<div>Message Duration Distribution</div>)
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn()
  };
});

describe('ProducerPage', () => {
  const mockProducerProgress: ProgressData = {
    number_messages_failed: 10,
    number_messages_sent: 100,
    number_messages_created: 200,
    message_times: [10, 20, 30],
    average_message_time: 20
  };

  let mockRefetch;
  let mockProducerProgressRefetch;
  let mockNavigate;

  beforeEach(() => {
    mockRefetch = vi.fn();
    mockProducerProgressRefetch = vi.fn();
    mockNavigate = vi.fn();
    mockProducerQuery('useGetProducerById', aProducer, false, false, null, mockRefetch);
    mockProducerQuery('useGetProducerProgress', mockProducerProgress, false, false, null, mockProducerProgressRefetch);
    mockProducerMutation('useGenerateMessages', 100);
    mockProducerMutation('useActivateProducer', 'success');
    mockProducerMutation('useDeleteProducer', 'success');
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state when data is pending', () => {
    mockProducerQuery('useGetProducerProgress', undefined, true);

    render(
      <MemoryRouter>
        <ProducerPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument(); // CircularProgress
  });

  it('should render error page when there is an error fetching producer', () => {
    mockProducerQuery('useGetProducerById', undefined, false, true, new Error('Failed to fetch producer'));

    render(
      <MemoryRouter>
        <ProducerPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('should render error page when there is an error fetching producer progress', () => {
    mockProducerQuery('useGetProducerProgress', undefined, false, true, new Error('Failed to fetch progress'));

    render(
      <MemoryRouter>
        <ProducerPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('should render producer details and progress when data is fetched successfully', async () => {
    render(
      <MemoryRouter>
        <ProducerPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/aName/i)).toBeInTheDocument();
    expect(screen.getByText(/aStatus/i)).toBeInTheDocument();
    expect(screen.getByText('Message Breakdown')).toBeInTheDocument();
    expect(screen.getByText('Message Duration Distribution')).toBeInTheDocument();
  });

  it('should update refresh rate when the user changes it', async () => {
    render(
      <MemoryRouter>
        <ProducerPage />
      </MemoryRouter>
    );

    fireEvent.pointerDown(screen.getByText('Actions'));
    fireEvent.click(screen.getByText(/Set Refresh Rate/i));
    const refreshRateInput = screen.getByTestId('refreshRate');
    fireEvent.change(refreshRateInput, { target: { value: '10' } });
    fireEvent.click(screen.getByText(/Save changes/i));

    expect(localStorage.getItem('refreshRate')).toBe('10');
  });

  it('should call refetch functions at the interval', () => {
    const setIntervalSpy = vi.spyOn(global, 'setInterval');
    localStorage.setItem('refreshRate', '5');

    render(
      <MemoryRouter>
        <ProducerPage />
      </MemoryRouter>
    );

    expect(setIntervalSpy).toHaveBeenCalledTimes(1);
    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 5000); // 5 seconds based on local storage
  });
});
