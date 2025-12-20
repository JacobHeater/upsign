import React from 'react';
import Link from 'next/link';
type Variant = 'primary' | 'secondary' | 'accent' | 'destructive' | 'ghost' | 'glass' | 'link';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: 'sm' | 'md' | 'lg';
    as?: 'button' | 'a';
    href?: string;
}

const sizeClass = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-base',
    lg: 'px-4 py-2 text-lg',
};

const variantClass = {
    primary: 'bg-primary-800 text-primary-50 border-t-2 border-t-primary-700 border-b-2 border-b-primary-900 border-l border-l-primary-800 border-r border-r-primary-800 shadow-lg hover:shadow-xl transition-all hover:tranform hover:scale-[1.02] active:transform active:scale-95',
    secondary: 'bg-secondary-50 text-secondary-foreground shadow-lg hover:shadow-xl transition-all hover:tranform hover:scale-[1.02] active:transform active:scale-95',
    accent: 'bg-accent-100 text-foreground border-t-2 border-t-accent-50 border-b-2 border-b-accent-200 border-l border-l-accent-100 border-r border-r-accent-100 shadow-lg hover:shadow-xl transition-all hover:tranform hover:scale-[1.02] active:transform active:scale-95',
    destructive: 'bg-destructive-400 text-destructive-foreground border-t-2 border-t-destructive-300 border-b-2 border-b-destructive-500 border-l border-l-destructive-400 border-r border-r-destructive-400 shadow-lg hover:shadow-xl transition-all hover:tranform hover:scale-[1.02] active:transform active:scale-95',
    ghost: 'text-primary-50 bg-transparent text-foreground border-2 border-none shadow-none cursor-pointer text-shadow-sm hover:text-shadow-lg',
    glass: 'bg-background/30 text-foreground border-none backdrop-blur-md hover:bg-background/40 transition-all',
    link: 'text-primary hover:text-accent active:text-accent border border-primary/30 hover:border-accent/50 hover:bg-primary/10 active:bg-primary/20 rounded-lg transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95',
};

export function Button({ variant = 'primary', size = 'md', className = '', as = 'button', children, href, ...rest }: ButtonProps) {
    const classes = `flex items-center justify-center rounded-lg font-bold shadow-md transition-all ${sizeClass[size]} ${variantClass[variant]} ${className}`;
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
