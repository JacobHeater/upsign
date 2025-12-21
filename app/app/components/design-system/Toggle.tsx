import React from 'react';

interface ToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    id?: string;
    className?: string;
    disabled?: boolean;
}

export function Toggle({ checked, onChange, id, className, disabled = false }: ToggleProps) {
    return (
        <label id={id} className={`flex items-center gap-2 text-sm ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${className || ''}`}>
            <div className="relative inline-block w-10 h-6">
                <input
                    id={id}
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => !disabled && onChange(e.target.checked)}
                    disabled={disabled}
                    className="sr-only peer"
                />
                <div className={`w-full h-full border-2 rounded-full transition-colors duration-300 ${disabled ? 'bg-muted border-muted' : 'bg-muted/50 border-muted peer-checked:bg-primary-500 peer-checked:border-primary-500'}`}></div>
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-card rounded-full shadow-md transition-all duration-300 ${disabled ? '' : ''}`} style={{ transform: checked ? 'translateX(1rem)' : 'translateX(0)' }}></div>
            </div>
        </label>
    );
}

export default Toggle;