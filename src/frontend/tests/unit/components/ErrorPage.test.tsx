import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { describe, it, vi, expect, beforeEach, afterEach } from 'vitest';
import ErrorPage from '../../../src/components/ErrorPage';
import { routes } from '../../../src/utils/routes';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn()
  };
});

describe('ErrorPage Component', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the error message and heading', () => {
    const error = new Error('Test error message');

    render(
      <MemoryRouter>
        <ErrorPage error={error} />
      </MemoryRouter>
    );

    expect(screen.getByText(/oops something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
    const button = screen.getByRole('button', { name: /go to dashboard/i });
    expect(button).toBeInTheDocument();
  });

  it('navigates to the Producers Dashboard when the button is clicked', () => {
    const error = new Error('Button click error');

    render(
      <MemoryRouter>
        <ErrorPage error={error} />
      </MemoryRouter>
    );

    const button = screen.getByRole('button', { name: /go to dashboard/i });
    fireEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith(routes.PRODUCERS);
  });
});
