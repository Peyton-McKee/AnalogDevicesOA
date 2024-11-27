import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, it, vi, beforeEach, afterEach, expect } from 'vitest';
import CreateProducerForm from '../../../../src/pages/ProducerForm/CreateProducerForm';
import { useToast } from '../../../../src/hooks/use-toast';
import { MemoryRouter, useNavigate } from 'react-router-dom'; // for navigation
import React from 'react';
import { mockProducerMutation } from '../../test-utils';
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

describe('CreateProducerForm', () => {
  let createProducerSpy;
  let toastFn;
  let mockToast;
  const mockNavigate = vi.fn();
  const expectedValues = {
    name: 'Test Producer',
    number_messages: 1000,
    average_send_delay: 5,
    num_senders: undefined,
    failure_rate: 10
  };

  beforeEach(() => {
    toastFn = vi.fn();
    mockToast = vi.fn().mockImplementation(() => {
      return {
        toast: toastFn
      };
    });
    createProducerSpy = mockProducerMutation('useCreateProducer', aProducer);
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    vi.mocked(useToast).mockReturnValue(mockToast());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('calls mutateAsync with the correct data when the form is submitted', async () => {
    render(
      <MemoryRouter>
        <CreateProducerForm />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Producer Name'), { target: { value: 'Test Producer' } });

    const submitButton = screen.getByText(/Submit/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      screen.getByText('Create Producer');
    }); // Let change process

    expect(createProducerSpy).toHaveBeenCalledWith(expectedValues);
    expect(mockNavigate).toHaveBeenCalledWith('/producers');
  });

  it('shows a toast message on error', async () => {
    createProducerSpy = mockProducerMutation('useCreateProducer', undefined, false, new Error('Failed to create producer'));

    render(
      <MemoryRouter>
        <CreateProducerForm />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Producer Name'), { target: { value: 'Test Producer' } });

    const submitButton = screen.getByText(/Submit/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      screen.getByText('Create Producer');
    }); // Let change process

    expect(toastFn).toHaveBeenCalledWith({
      title: 'Failed to Create Producer',
      description: 'Failed to create producer'
    });
  });
});
