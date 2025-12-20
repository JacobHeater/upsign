'use client';

import { useState, useRef, useEffect } from 'react';

interface TooltipProps {
    children: React.ReactNode;
    content: string;
}

export function Tooltip({ children, content }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState({ top: true, center: true });
    const containerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isVisible && containerRef.current && tooltipRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect();
            const tooltipRect = tooltipRef.current.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            let newPosition = { top: true, center: true };

            // Check if tooltip would go off top
            if (containerRect.top - tooltipRect.height - 8 < 0) {
                newPosition.top = false; // Show below
            }

            // Check horizontal centering
            const tooltipLeft = containerRect.left + (containerRect.width / 2) - (tooltipRect.width / 2);
            if (tooltipLeft < 8) {
                // Too far left, align to left edge
                newPosition.center = false;
            } else if (tooltipLeft + tooltipRect.width > viewportWidth - 8) {
                // Too far right, align to right edge
                newPosition.center = false;
            }

            setPosition(newPosition);
        }
    }, [isVisible]);

    return (
        <div ref={containerRef} className="relative inline-block">
            <div
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={() => setIsVisible(false)}
            >
                {children}
            </div>
            {isVisible && (
                <div
                    ref={tooltipRef}
                    className={`absolute px-2 py-1 bg-black text-white text-sm rounded whitespace-pre z-10 ${position.top ? 'bottom-full mb-1' : 'top-full mt-1'
                        } ${position.center ? 'left-1/2 transform -translate-x-1/2' : position.top ? 'left-0' : 'right-0'
                        }`}
                >
                    {content}
                    {/* Arrow */}
                    <div
                        className={`absolute w-0 h-0 ${position.top
                            ? 'top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-black'
                            : 'bottom-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-b-4 border-transparent border-b-black'
                            }`}
                    ></div>
                </div>
            )}
        </div>
    );
}