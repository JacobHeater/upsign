import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IconSelector } from '../IconSelector';

describe('IconSelector', () => {
    it('renders with default value', () => {
        render(<IconSelector value="🎉" onChange={() => { }} />);
        const select = screen.getByRole('combobox');
        expect(select).toBeInTheDocument();
        expect(select).toHaveValue('🎉');
    });

    it('displays all available icons', () => {
        render(<IconSelector value="🎉" onChange={() => { }} />);
        const options = screen.getAllByRole('option');
        expect(options.length).toBeGreaterThan(20); // Should have many icons
        expect(options[0]).toHaveTextContent('🎉 Party Popper');
    });

    it('calls onChange when selection changes', () => {
        const mockOnChange = jest.fn();
        render(<IconSelector value="🎉" onChange={mockOnChange} />);
        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: '🎂' } });
        expect(mockOnChange).toHaveBeenCalledWith('🎂');
    });

    it('applies custom className', () => {
        render(<IconSelector value="🎉" onChange={() => { }} className="custom-class" />);
        const container = screen.getByRole('combobox').parentElement;
        expect(container).toHaveClass('custom-class');
    });
});