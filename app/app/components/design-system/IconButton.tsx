import React from 'react';
import Link from 'next/link';

type Variant = 'primary' | 'secondary' | 'accent' | 'destructive' | 'ghost' | 'glass';
type Icon = 'trash' | 'add' | 'edit' | 'delete';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: 'sm' | 'md' | 'lg';
    as?: 'button' | 'a';
    href?: string;
    icon: Icon;
}

const sizeClass = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-base',
    lg: 'px-4 py-3 text-lg',
};

const variantClass = {
    primary: 'bg-primary-800 text-primary-50 border-t-2 border-t-primary-700 border-b-2 border-b-primary-900 border-l border-l-primary-800 border-r border-r-primary-800 shadow-lg hover:shadow-xl transition-all hover:tranform hover:scale-[1.02] active:transform active:scale-95',
    secondary: 'bg-secondary text-secondary-foreground border-t-2 border-t-secondary-300 border-b-2 border-b-secondary-700 border-l border-l-secondary border-r border-r-secondary shadow-lg hover:shadow-xl transition-all hover:tranform hover:scale-[1.02] active:transform active:scale-95',
    accent: 'bg-accent-100 text-foreground border-t-2 border-t-accent-50 border-b-2 border-b-accent-200 border-l border-l-accent-100 border-r border-r-accent-100 shadow-lg hover:shadow-xl transition-all hover:tranform hover:scale-[1.02] active:transform active:scale-95',
    destructive: 'bg-destructive-400 text-destructive-foreground border-t-2 border-t-destructive-300 border-b-2 border-b-destructive-500 border-l border-l-destructive-400 border-r border-r-destructive-400 shadow-lg hover:shadow-xl transition-all hover:tranform hover:scale-[1.02] active:transform active:scale-95',
    ghost: 'text-primary-50 bg-transparent text-foreground border-2 border-none shadow-none cursor-pointer text-shadow-sm hover:text-shadow-lg',
    glass: 'bg-background/30 text-foreground border-none backdrop-blur-md hover:bg-background/40 transition-all',
};

const iconMap = {
    trash: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    add: '➕',
    edit: '✏️',
    delete: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
};

export function IconButton({ variant = 'primary', size = 'md', className = '', as = 'button', children, href, icon, ...rest }: IconButtonProps) {
    const classes = `inline-flex items-center justify-center rounded-lg font-bold shadow-md transition-all ${sizeClass[size]} ${variantClass[variant]} ${className}`;
    const iconElement = <span className="mr-1">{iconMap[icon]}</span>;

    // If href is provided, use Next Link for client-side navigation
    if (href) {
        return (
            <Link href={href} className={classes} {...(rest as any)}>
                {iconElement}
                {children}
            </Link>
        );
    }

    if (as === 'a') {
        return (
            // eslint-disable-next-line jsx-a11y/anchor-has-content
            <a {...(rest as any)} className={classes}>
                {iconElement}
                {children}
            </a>
        );
    }

    return (
        <button
            {...(rest as any)}
            className={classes}
        >
            {iconElement}
            {children}
        </button>
    );
}