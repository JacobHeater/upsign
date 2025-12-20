import React from 'react';
import { render } from '@testing-library/react';
import { Input } from '../Input';

describe('Input forwardRef', () => {
    it('forwards ref to the underlying input element', () => {
        const ref = React.createRef<HTMLInputElement>();
        render(<Input ref={ref} placeholder="search" />);
        expect(ref.current).not.toBeNull();
        expect(ref.current?.tagName.toLowerCase()).toBe('input');
    });
});
