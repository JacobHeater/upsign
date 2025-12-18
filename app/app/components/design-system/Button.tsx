import React from 'react';
import Link from 'next/link';
type Variant = 'primary' | 'secondary' | 'accent' | 'destructive' | 'ghost';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: 'sm' | 'md' | 'lg';
    as?: 'button' | 'a';
    href?: string;
}

const sizeClass = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
};

const variantClass = {
    primary: 'bg-primary-500 text-primary-50 border-2 border-primary-900 shadow-md hover:shadow-lg transition-all hover:tranform hover:scale-[1.02] active:transform active:scale-95',
    secondary: 'bg-secondary text-secondary-foreground border-2 border-secondary shadow-md hover:shadow-lg transition-all hover:tranform hover:scale-[1.02] active:transform active:scale-95',
    accent: 'bg-accent-50 text-foreground border-2 border-accent-900 shadow-md hover:shadow-lg transition-all hover:tranform hover:scale-[1.02] active:transform active:scale-95',
    destructive: 'bg-destructive text-destructive-foreground border-2 border-destructive hover:bg-destructive/90 hover:shadow-destructive/50',
    ghost: 'bg-transparent text-foreground border-2 border-transparent hover:bg-muted/10',
};

export function Button({ variant = 'primary', size = 'md', className = '', as = 'button', children, href, ...rest }: ButtonProps) {
    const classes = `inline-flex items-center justify-center rounded-lg font-bold shadow-md transition-all ${sizeClass[size]} ${variantClass[variant]} ${className}`;
    // If href is provided, use Next Link for client-side navigation
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
            className={classes}
        >
            {children}
        </button>
    );
}

export default Button;
