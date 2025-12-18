import React from 'react';
import { render, screen } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
    it('renders with children and defaults', () => {
        render(<Button>Click me</Button>);
        expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('renders as anchor when as="a"', () => {
        render(<Button as="a" href="/test">Link</Button>);
        const el = screen.getByText('Link');
        expect(el.tagName.toLowerCase()).toBe('a');
    });
});
