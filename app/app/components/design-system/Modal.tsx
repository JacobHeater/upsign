'use client';

import React, { useEffect } from 'react';
import { Card } from './Card';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    closeOnOutsideClick?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    closeOnOutsideClick = true,
}) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        };
    }, [isOpen, onClose]);

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (closeOnOutsideClick && e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[10000] flex items-center justify-center backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(0, 103, 68, 0.15)' }}
            onClick={handleBackdropClick}
        >
            <Card
                className="shadow-2xl p-6 max-w-md w-full mx-4"
                style={{
                    background: 'linear-gradient(180deg, rgba(217 224 229 / 0.38), rgba(61 98 129 / 0.24))',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                    backdropFilter: 'blur(20px) saturate(180%)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 -4px 16px rgba(0, 0, 0, 0.15)',
                }}
            >
                {title && (
                    <h3 className="text-lg font-semibold mb-4" style={{
                        color: 'var(--accent-foreground)',
                    }}>{title}</h3>
                )}
                {children}
            </Card>
        </div>
    );
};

export default Modal;