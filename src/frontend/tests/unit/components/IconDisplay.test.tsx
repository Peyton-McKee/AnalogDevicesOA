import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import IconDisplay from '../../../src/components/IconDisplay';

describe('IconDisplay Component', () => {
  it('renders the icon and label correctly', () => {
    const TestIcon = <span data-testid="test-icon">🔔</span>;
    const labelText = 'Test Label';

    render(<IconDisplay icon={TestIcon} label={labelText} />);

    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    expect(screen.getByText(labelText)).toBeInTheDocument();
  });
});
