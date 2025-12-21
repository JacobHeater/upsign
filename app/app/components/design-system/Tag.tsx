'use client';

import React, { useRef, useEffect, useState } from 'react';

interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'destructive' | 'glass' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
}

export function Tag({
    variant = 'default',
    size = 'md',
    className = '',
    children,
    ...rest
}: TagProps) {
    const [bgGradient, setBgGradient] = useState('linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))');
    const tagRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (tagRef.current) {
            const parent = tagRef.current.parentElement;
            if (parent) {
                const bgColor = getComputedStyle(parent).backgroundColor;
                const rgb = bgColor.match(/\d+/g);
                if (rgb) {
                    const r = parseInt(rgb[0]);
                    const g = parseInt(rgb[1]);
                    const b = parseInt(rgb[2]);
                    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                    if (luminance < 0.5) {
                        setBgGradient('linear-gradient(135deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.05))');
                    } else {
                        setBgGradient('linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))');
                    }
                }
            }
        }
    }, []);

    const sizeClasses = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1.5 text-sm',
        lg: 'px-4 py-2 text-base',
    }[size];

    const variantClasses = {
        default: 'border-muted-foreground/20',
        primary: 'border-primary/30',
        secondary: 'border-secondary',
        accent: 'border-accent/30',
        destructive: 'border-destructive/30',
        glass: 'border-white/20',
        danger: 'bg-destructive-500 text-destructive-foreground border-destructive-500',
    }[variant];

    const glassStyle: React.CSSProperties = variant === 'glass' ? {
        background: 'rgba(255, 255, 255, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        WebkitBackdropFilter: 'blur(12px) saturate(150%)',
        backdropFilter: 'blur(12px) saturate(150%)',
        boxShadow: '0 4px 16px rgba(2, 6, 23, 0.12), inset 0 -2px 8px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
    } : variant === 'danger' ? {
        background: 'var(--destructive-500)',
        border: '1px solid var(--destructive-500)',
        boxShadow: '0 2px 8px rgba(211, 47, 47, 0.3)',
        color: 'var(--destructive-foreground)',
    } : {
        background: bgGradient,
        border: '1px solid rgba(255, 255, 255, 0.12)',
        WebkitBackdropFilter: 'blur(8px) saturate(120%)',
        backdropFilter: 'blur(8px) saturate(120%)',
        boxShadow: '0 2px 8px rgba(2, 6, 23, 0.08), inset 0 -2px 4px rgba(0, 0, 0, 0.05)',
    };

    const sheenBg = variant === 'glass'
        ? 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.25), rgba(255,255,255,0.1) 40%, transparent 60%)'
        : variant === 'danger'
            ? 'transparent'
            : 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.15), rgba(255,255,255,0.05) 40%, transparent 60%)';

    return (
        <span
            ref={tagRef}
            className={`inline-flex items-center rounded-full font-medium transition-all duration-200 text-foreground ${sizeClasses} ${variantClasses} ${className}`.trim()}
            style={glassStyle}
            {...rest}
        >
            {/* Sheen overlay */}
            <span
                aria-hidden
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                    background: sheenBg,
                    mixBlendMode: 'screen',
                }}
            />
            {/* Content */}
            <span className="relative z-10">{children}</span>
        </span>
    );
}

export default Tag;