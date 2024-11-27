import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ProducerActions from '../../../../src/pages/ProducerPage/ProducerActions';
import { useToast } from '../../../../src/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import React from 'react';
import { mockProducerMutation } from '../../test-utils';
import { aProducer } from '../../test-data';

vi.mock('../../../../src/hooks/producer.hooks');

vi.mock('../../../../src/hooks/use-toast', () => ({
  useToast: vi.fn()
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn()
  };
});

describe('ProducerActions', () => {
  let mockOnRefreshRateChanged;
  let mockNavigate;
  let generateMessagesSpy;
  let activateSpy;
  let toastFn;
  let mockToast;
  let deleteSpy;

  beforeEach(() => {
    mockOnRefreshRateChanged = vi.fn();
    mockNavigate = vi.fn();
    toastFn = vi.fn();
    mockToast = vi.fn().mockImplementation(() => {
      return {
        toast: toastFn
      };
    });
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    vi.mocked(useToast).mockReturnValue(mockToast());

    generateMessagesSpy = mockProducerMutation('useGenerateMessages', 100);
    activateSpy = mockProducerMutation('useActivateProducer', 'Successfully Sent Messages');
    deleteSpy = mockProducerMutation('useDeleteProducer', 'Deleted Prodcuer');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should call generateMessages when "Generate Messages" is clicked', async () => {
    render(<ProducerActions producer={aProducer} onRefreshRateChanged={mockOnRefreshRateChanged} />);

    fireEvent.pointerDown(screen.getByText('Actions'));

    fireEvent.click(screen.getByText('Generate Messages'));

    await waitFor(() => expect(generateMessagesSpy).toHaveBeenCalledTimes(1));
    expect(toastFn).toHaveBeenCalledWith({
      title: 'Successfully generated new messages'
    });
  });

  it('should show an error toast if generating messages fails', async () => {
    generateMessagesSpy = mockProducerMutation('useGenerateMessages', undefined, false, new Error('Network error'));

    render(<ProducerActions producer={aProducer} onRefreshRateChanged={mockOnRefreshRateChanged} />);

    fireEvent.pointerDown(screen.getByText('Actions'));

    fireEvent.click(screen.getByText('Generate Messages'));

    await waitFor(() => expect(generateMessagesSpy).toHaveBeenCalledTimes(1));
    expect(toastFn).toHaveBeenCalledWith({
      title: 'Failed to generate messages',
      description: 'Network error'
    });
  });

  it('should call activateProducer when "Send Messages" is clicked', async () => {
    render(<ProducerActions producer={aProducer} onRefreshRateChanged={mockOnRefreshRateChanged} />);

    fireEvent.pointerDown(screen.getByText('Actions'));

    fireEvent.click(screen.getByText('Send Messages'));

    await waitFor(() => expect(activateSpy).toHaveBeenCalledTimes(1));
    expect(toastFn).toHaveBeenCalledWith({
      title: 'Successfully sent all pending messages'
    });
  });

  it('should show an error toast if activating producer fails', async () => {
    activateSpy = mockProducerMutation('useActivateProducer', undefined, false, new Error('Failed to activate'));

    render(<ProducerActions producer={aProducer} onRefreshRateChanged={mockOnRefreshRateChanged} />);

    fireEvent.pointerDown(screen.getByText('Actions'));

    fireEvent.click(screen.getByText('Send Messages'));

    await waitFor(() => expect(activateSpy).toHaveBeenCalledTimes(1));
    expect(toastFn).toHaveBeenCalledWith({
      title: 'Failed to activate prodcuer',
      description: 'Failed to activate'
    });
  });

  it('should call deleteProducer when "Delete Producer" is clicked', async () => {
    render(<ProducerActions producer={aProducer} onRefreshRateChanged={mockOnRefreshRateChanged} />);

    fireEvent.pointerDown(screen.getByText('Actions'));

    fireEvent.click(screen.getByText('Delete Producer'));

    await waitFor(() => expect(deleteSpy).toHaveBeenCalledTimes(1));
    expect(toastFn).toHaveBeenCalledWith({
      title: 'Successfully deleted producer'
    });
    expect(mockNavigate).toHaveBeenCalledWith('/producers');
  });

  it('should show an error toast if deleting producer fails', async () => {
    deleteSpy = mockProducerMutation('useDeleteProducer', undefined, false, new Error('Failed to delete'));

    render(<ProducerActions producer={aProducer} onRefreshRateChanged={mockOnRefreshRateChanged} />);

    fireEvent.pointerDown(screen.getByText('Actions'));

    fireEvent.click(screen.getByText('Delete Producer'));

    await waitFor(() => expect(deleteSpy).toHaveBeenCalledTimes(1));
    expect(toastFn).toHaveBeenCalledWith({
      title: 'Failed to delete prodcuer',
      description: 'Failed to delete'
    });
  });
});
