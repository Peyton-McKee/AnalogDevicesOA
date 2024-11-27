import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MessageBreakdown from '../../../src/components/MessageBreakdown';

describe('MessageBreakdown Component', () => {
  it('displays a "No Messages Generated Yet" message when totalMessages is 0', () => {
    render(<MessageBreakdown totalMessages={0} numberSent={0} numberFailed={0} />);
    expect(screen.getByText(/No Messages Generated Yet/i)).toBeInTheDocument();
  });

  it('renders the PieChart with title and footer', () => {
    render(<MessageBreakdown totalMessages={100} numberSent={80} numberFailed={10} />);

    expect(screen.getByText('Message Breakdown')).toBeInTheDocument();
    expect(screen.getByText(/Showing Message Breakdown for This Producer/i)).toBeInTheDocument();
  });

  //Manually verify the chart appears correctly. Recharts is not easily testable
});
