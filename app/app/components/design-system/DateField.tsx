import React from 'react';

interface DateFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export function DateField({ label, className = '', ...rest }: DateFieldProps) {
    return (
        <div className={`flex flex-col ${className}`}>
            {label && <label className="text-sm mb-1 text-foreground">{label}</label>}
            <input type="date" {...rest} className="rounded-md border-2 border-input bg-transparent px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
    );
}

export default DateField;