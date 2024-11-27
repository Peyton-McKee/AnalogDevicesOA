import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, it, vi, beforeEach, afterEach, expect } from 'vitest';
import UpdateProducerForm from '../../../../src/pages/ProducerForm/UpdateProducerForm';
import { useToast } from '../../../../src/hooks/use-toast';
import { MemoryRouter, useNavigate } from 'react-router-dom'; // for navigation
import React from 'react';
import { mockProducerMutation, mockProducerQuery } from '../../test-utils';
import { aProducer } from '../../test-data';

// Mock hooks
vi.mock('../../../../src/hooks/producer.hooks');
vi.mock('../../../../src/hooks/use-toast');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn()
  };
});

describe('EditProducerForm', () => {
  let editProducerSpy;
  let toastFn;
  let mockToast;
  const mockNavigate = vi.fn();

  beforeEach(() => {
    toastFn = vi.fn();
    mockToast = vi.fn().mockImplementation(() => {
      return {
        toast: toastFn
      };
    });
    editProducerSpy = mockProducerMutation('useUpdateProducer', aProducer);
    mockProducerQuery('useGetProducerById', aProducer);
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    vi.mocked(useToast).mockReturnValue(mockToast());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('calls mutateAsync with the correct data when the form is submitted', async () => {
    render(
      <MemoryRouter>
        <UpdateProducerForm />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Producer Name'), { target: { value: 'Test Producer' } });

    const submitButton = screen.getByText(/Submit/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      screen.getByText('Update Producer aName');
    }); // Let change process

    expect(editProducerSpy).toHaveBeenCalledWith({
      average_send_delay: aProducer.average_send_delay,
      number_messages: aProducer.number_messages,
      num_senders: aProducer.num_senders,
      failure_rate: aProducer.failure_rate,
      name: 'Test Producer'
    });
    expect(mockNavigate).toHaveBeenCalledWith('/producers');
  });

  it('shows a toast message on error', async () => {
    editProducerSpy = mockProducerMutation('useUpdateProducer', undefined, false, new Error('Failed to edit producer'));

    render(
      <MemoryRouter>
        <UpdateProducerForm />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Producer Name'), { target: { value: 'Test Producer' } });

    const submitButton = screen.getByText(/Submit/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      screen.getByText('Update Producer aName');
    }); // Let change process

    expect(toastFn).toHaveBeenCalledWith({
      title: 'Failed to Update Producer',
      description: 'Failed to edit producer'
    });
  });
});
