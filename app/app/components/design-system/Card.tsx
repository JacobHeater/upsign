import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    as?: 'div' | 'a' | 'button';
    size?: 'sm' | 'md' | 'lg';
}

export function Card({ as = 'div', className = '', children, size = 'md', style, ...rest }: CardProps) {
    const Comp: any = as;

    const sizePad = {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    }[size];

    const base = `relative overflow-visible rounded-xl transition-transform duration-200 ${sizePad}`;

    const glassStyle: React.CSSProperties = {
        background: 'linear-gradient(180deg, rgba(240, 255, 250, 0.7), rgba(224, 255, 245, 0.36))',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        WebkitBackdropFilter: 'blur(14px) saturate(140%)',
        backdropFilter: 'blur(14px) saturate(140%)',
        boxShadow: '0 6px 20px rgba(2, 6, 23, 0.12), inset 0 -4px 12px rgba(0, 0, 0, 0.1)',
        transition: 'transform 220ms ease, box-shadow 220ms ease',
    };

    const sheenBg = `radial-gradient(circle at 20% 18%, rgba(255,255,255,0.06), rgba(255,255,255,0.01) 30%, transparent 42%), linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.005))`;
    const rimBg = 'linear-gradient(90deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03))';

    return (
        <Comp
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

