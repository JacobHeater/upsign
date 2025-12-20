import React from 'react';

interface ToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    id?: string;
    className?: string;
}

export function Toggle({ checked, onChange, id, className }: ToggleProps) {
    return (
        <label id={id} className={`flex items-center gap-2 text-sm cursor-pointer ${className || ''}`}>
            <div className="relative inline-block w-10 h-6">
                <input
                    id={id}
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    className="sr-only peer"
                />
                <div className="w-full h-full bg-muted/50 border-2 border-muted rounded-full peer-checked:bg-primary-500 peer-checked:border-primary-500 transition-colors duration-300"></div>
                <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-card rounded-full shadow-md transform peer-checked:translate-x-4 transition-transform duration-300"></div>
            </div>
        </label>
    );
}

export default Toggle;