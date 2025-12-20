import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Input } from '../Input';

describe('Input', () => {
    it('renders input with placeholder', () => {
        render(<Input placeholder="test" />);
        expect(screen.getByPlaceholderText('test')).toBeInTheDocument();
    });
});
