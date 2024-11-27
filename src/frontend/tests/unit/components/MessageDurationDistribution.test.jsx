import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MessageDurationDistribution from '../../../src/components/MessageDurationDistribution';
import { AreaChart } from 'recharts';

// Mock AreaChart to track its props
vi.mock('recharts', async (original) => {
  const mod = await original();
  return {
    ...mod,
    AreaChart: vi.fn(({ data }) => <div data-testid="mock-chart">{JSON.stringify(data)}</div>)
  };
});

describe('MessageDurationDistribution Component', () => {
  it('renders the title and description', () => {
    render(<MessageDurationDistribution messageTimes={[]} />);
    expect(screen.getByText('Message Duration Distribution')).toBeInTheDocument();
    expect(screen.getByText('Showing distribution of the time each message took to send')).toBeInTheDocument();
  });

  it('passes the correct chart data to AreaChart', () => {
    const messageTimes = [1, 2, 2, 3, 3, 3];
    render(<MessageDurationDistribution messageTimes={messageTimes} />);

    // Expected chart data
    const expectedData = [
      { x: 1, y: 1 },
      { x: 2, y: 2 },
      { x: 3, y: 3 }
    ];

    // Verify AreaChart is called with the correct data
    expect(AreaChart).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.arrayContaining(expectedData)
      }),
      expect.anything()
    );
  });

  it('renders empty chart data when messageTimes is empty', () => {
    render(<MessageDurationDistribution messageTimes={[]} />);

    // Verify AreaChart is called with an empty array
    expect(AreaChart).toHaveBeenCalledWith(
      expect.objectContaining({
        data: []
      }),
      expect.anything()
    );
  });
});
