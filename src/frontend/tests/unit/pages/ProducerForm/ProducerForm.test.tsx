import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, vi, beforeEach, expect } from 'vitest';
import ProducerForm from '../../../../src/pages/ProducerForm/ProducerForm';
import { ProducerArgs } from '../../../../src/utils/types';
import React from 'react';

describe('ProducerForm', () => {
  const mockOnSubmit = vi.fn();
  const defaultValues: ProducerArgs = {
    name: 'Test Producer',
    number_messages: 1000,
    average_send_delay: 5,
    failure_rate: 10,
    num_senders: 4
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form with default values', () => {
    render(<ProducerForm onSubmit={mockOnSubmit} defaultValues={defaultValues} title="Producer Form" />);

    expect(screen.getByText('Producer Form')).toBeInTheDocument();

    expect(screen.getByPlaceholderText('Producer Name')).toHaveValue('Test Producer');
    expect(screen.getByPlaceholderText('1000')).toHaveValue(1000);
    expect(screen.getByPlaceholderText('5')).toHaveValue(5);
    expect(screen.getByPlaceholderText('10%')).toHaveValue(10);
    expect(screen.getByPlaceholderText('Number of Available Threads')).toHaveValue(4);
  });

  it('validates required fields and shows error messages when form is submitted without data', async () => {
    render(<ProducerForm onSubmit={mockOnSubmit} defaultValues={defaultValues} title="Producer Form" />);

    fireEvent.change(screen.getByPlaceholderText('Producer Name'), { target: { value: '' } });
    fireEvent.change(screen.getByPlaceholderText('1000'), { target: { value: '' } });
    fireEvent.change(screen.getByPlaceholderText('5'), { target: { value: '' } });
    fireEvent.change(screen.getByPlaceholderText('10%'), { target: { value: '' } });

    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(
        screen.getByText(
          'number_messages must be a `number` type, but the final value was: `NaN` (cast from the value `""`).'
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'average_send_delay must be a `number` type, but the final value was: `NaN` (cast from the value `""`).'
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText('failure_rate must be a `number` type, but the final value was: `NaN` (cast from the value `""`).')
      ).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with correct values when form is valid', async () => {
    render(<ProducerForm onSubmit={mockOnSubmit} defaultValues={defaultValues} title="Producer Form" />);

    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    expect(mockOnSubmit).toHaveBeenCalledWith(defaultValues);
  });
});
