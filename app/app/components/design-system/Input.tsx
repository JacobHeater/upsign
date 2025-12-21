import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ label, className = '', disabled = false, ...rest }, ref) => {
    return (
        <div className={`flex flex-col ${className}`}>
            {label && <label className={`text-sm mb-1 ${disabled ? 'text-muted-foreground' : 'text-foreground'}`}>{label}</label>}
            <input ref={ref} {...rest} disabled={disabled} className={`rounded-md border-2 px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-ring ${disabled ? 'border-gray-300 bg-gray-200 text-gray-500 cursor-not-allowed' : 'border-input bg-input text-foreground'}`} />
        </div>
    );
});

Input.displayName = 'Input';
