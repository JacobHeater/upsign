import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IconButton } from '../IconButton';

describe('IconButton', () => {
    it('renders with trash icon', () => {
        render(<IconButton icon="trash" onClick={() => { }}>Delete</IconButton>);
        expect(screen.getByRole('button')).toBeInTheDocument();
        expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('renders with add icon', () => {
        render(<IconButton icon="add" onClick={() => { }}>Add</IconButton>);
        expect(screen.getByText('➕')).toBeInTheDocument();
    });
});