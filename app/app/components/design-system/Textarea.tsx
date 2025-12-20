import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
}

export function Textarea({ label, className = '', ...rest }: TextareaProps) {
    return (
        <div className={`flex flex-col ${className}`}>
            {label && <label className="text-sm mb-1 text-foreground">{label}</label>}
            <textarea {...rest} className="rounded-lg bg-input px-4 py-3 text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>
    );
}

export default Textarea;
