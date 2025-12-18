import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ label, className = '', ...rest }, ref) => {
    return (
        <div className={`flex flex-col ${className}`}>
            {label && <label className="text-sm mb-1 text-foreground">{label}</label>}
            <input ref={ref} {...rest} className="rounded-md border-2 border-input bg-input px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>
    );
});

Input.displayName = 'Input';
