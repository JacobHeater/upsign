import React from 'react';
import Link from 'next/link';
type Variant = 'primary' | 'secondary' | 'accent' | 'destructive' | 'ghost' | 'glass' | 'link' | 'white';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: 'sm' | 'md' | 'lg';
    as?: 'button' | 'a';
    href?: string;
    disabled?: boolean;
}

const sizeClass = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-base',
    lg: 'px-4 py-2 text-lg',
};

const variantClass = (variant: Variant, disabled: boolean) => {
    const base = {
        primary: 'bg-primary-800 text-primary-50 border-t-2 border-t-primary-700 border-b-2 border-b-primary-900 border-l border-l-primary-800 border-r border-r-primary-800 shadow-lg',
        secondary: 'bg-secondary-50 text-secondary-foreground shadow-lg',
        accent: 'bg-accent-100 text-foreground border-t-2 border-t-accent-50 border-b-2 border-b-accent-200 border-l border-l-accent-100 border-r border-r-accent-100 shadow-lg',
        destructive: 'bg-destructive-400 text-destructive-foreground border-t-2 border-t-destructive-300 border-b-2 border-b-destructive-500 border-l border-l-destructive-400 border-r border-r-destructive-400 shadow-lg',
        ghost: 'text-primary-50 bg-transparent text-foreground border-2 border-none shadow-none cursor-pointer text-shadow-sm',
        glass: 'bg-background/30 text-foreground border-none backdrop-blur-md',
        link: 'text-primary border border-primary/30 rounded-lg shadow-lg',
        white: 'bg-input text-card-foreground border-t-2 border-t-input border-b-2 border-b-input/80 border-l border-l-input border-r border-r-input shadow-lg',
    }[variant];

    const hover = disabled ? '' : {
        primary: 'hover:shadow-xl',
        secondary: 'hover:shadow-xl',
        accent: 'hover:shadow-xl',
        destructive: 'hover:shadow-xl',
        ghost: 'hover:text-shadow-lg',
        glass: 'hover:bg-background/40',
        link: 'hover:border-accent/50 hover:bg-primary/10 active:bg-primary/20 hover:text-accent active:text-accent',
        white: 'hover:shadow-xl',
    }[variant] || '';

    return `${base} ${hover}`;
};

const sanitizeClassName = (className: string, disabled: boolean) => {
    if (!disabled) return className;
    // Remove hover and animation classes when disabled
    return className
        .split(' ')
        .filter(cls => !cls.startsWith('hover:') && !cls.includes('animate-') && !cls.includes('transition-'))
        .join(' ');
};

export function Button({ variant = 'primary', size = 'md', className = '', as = 'button', children, href, disabled = false, ...rest }: ButtonProps) {
    const baseClasses = `flex items-center justify-center rounded-lg font-bold shadow-md transition-all ${sizeClass[size]} ${variantClass(variant, disabled)}`;
    const interactiveClasses = disabled ? '' : 'hover:scale-[1.02] active:scale-95';
    const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
    const sanitizedClassName = sanitizeClassName(className, disabled);
    const classes = `${baseClasses} ${interactiveClasses} ${disabledClasses} ${sanitizedClassName}`;
    // If href is provided, use Next Link for client-side navigation
    if (disabled && href) {
        href = '#';
    }

    if (href) {
        return (
            <Link href={href} className={classes} {...(rest as any)}>
                {children}
            </Link>
        );
    }

    if (as === 'a') {
        return (
            // eslint-disable-next-line jsx-a11y/anchor-has-content
            <a {...(rest as any)} className={classes}>
                {children}
            </a>
        );
    }

    return (
        <button
            {...(rest as any)}
            disabled={disabled}
            className={classes}
        >
            {children}
        </button>
    );
}

export default Button;
