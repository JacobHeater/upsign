import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toggle } from '../Toggle';

describe('Toggle', () => {
    it('calls onChange when toggled', async () => {
        const user = userEvent.setup();
        const onChange = jest.fn();
        render(<Toggle checked={false} onChange={onChange} />);
        const input = screen.getByRole('checkbox') as HTMLInputElement;
        await user.click(input);
        expect(onChange).toHaveBeenCalledWith(true);
    });
});
