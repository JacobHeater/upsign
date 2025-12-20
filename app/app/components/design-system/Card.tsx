'use client';

import React, { useRef, useEffect, useState } from 'react';

interface CardProps extends React.HTMLAttributes<HTMLElement> {
    as?: 'div' | 'a' | 'button';
    size?: 'sm' | 'md' | 'lg';
    hoverEffect?: 'scale' | 'lift' | 'none';
}

export function Card({ as = 'div', className = '', children, size = 'md', hoverEffect = 'none', style, ...rest }: CardProps) {
    const Comp = as;
    const [bgGradient, setBgGradient] = useState('linear-gradient(180deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))');
    const cardRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (cardRef.current) {
            const parent = cardRef.current.parentElement;
            if (parent) {
                const bgColor = getComputedStyle(parent).backgroundColor;
                const rgb = bgColor.match(/\d+/g);
                if (rgb) {
                    const r = parseInt(rgb[0]);
                    const g = parseInt(rgb[1]);
                    const b = parseInt(rgb[2]);
                    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                    if (luminance < 0.5) {
                        setBgGradient('linear-gradient(180deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.05))');
                    } else {
                        setBgGradient('linear-gradient(180deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))');
                    }
                }
            }
        }
    }, []);

    const sizePad = {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    }[size];

    const hoverClass = {
        scale: 'hover:scale-105',
        lift: 'hover:-translate-y-1',
        none: '',
    }[hoverEffect];

    const base = `relative overflow-visible rounded-xl transition-all duration-300 ease-in-out ${hoverClass} ${sizePad}`;

    const glassStyle: React.CSSProperties = {
        background: bgGradient,
        border: '1px solid rgba(255, 255, 255, 0.12)',
        WebkitBackdropFilter: 'blur(14px) saturate(140%)',
        backdropFilter: 'blur(14px) saturate(140%)',
        boxShadow: '0 6px 20px rgba(2, 6, 23, 0.12), inset 0 -4px 12px rgba(0, 0, 0, 0.1)',
    };

    const sheenBg = `radial-gradient(circle at 20% 18%, rgba(255,255,255,0.06), rgba(255,255,255,0.01) 30%, transparent 42%), linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.005))`;
    const rimBg = 'linear-gradient(90deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03))';

    return (
        <Comp
            ref={cardRef as any}
            className={`${base} ${className}`.trim()}
            style={{ ...glassStyle, ...style }}
            {...rest}
        >
            {/* Sheen overlay (replaces ::before) */}
            <span
                aria-hidden
                className="absolute inset-0 z-0 pointer-events-none"
                style={{
                    background: sheenBg,
                    mixBlendMode: 'screen',
                    borderRadius: 'inherit',
                }}
            />

            {/* Subtle rim highlight (replaces ::after) */}
            <span
                aria-hidden
                className="absolute left-[8%] right-[8%] top-[4%] h-[4px] rounded-full z-0 opacity-80 pointer-events-none"
                style={{
                    background: rimBg,
                    filter: 'blur(2px)',
                }}
            />

            {/* Content */}
            <div className="relative z-10">{children}</div>
        </Comp>
    );
}

export default Card;

