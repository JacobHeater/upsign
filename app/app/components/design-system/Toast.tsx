'use client';

import React, { useState, useEffect } from 'react';

interface ToastProps {
    message: string;
    type?: 'success' | 'error' | 'info';
    duration?: number;
    onClose: () => void;
}

function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const bgColor = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
    }[type];

    return (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg text-white shadow-lg ${bgColor}`}>
            {message}
        </div>
    );
}

let toastId = 0;
const toasts: { id: number; message: string; type: 'success' | 'error' | 'info' }[] = [];

export function ToastContainer() {
    const [currentToasts, setCurrentToasts] = useState(toasts);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentToasts([...toasts]);
        }, 100);
        return () => clearInterval(interval);
    }, []);

    const removeToast = (id: number) => {
        const index = toasts.findIndex(t => t.id === id);
        if (index > -1) toasts.splice(index, 1);
        setCurrentToasts([...toasts]);
    };

    return (
        <div className="fixed top-0 right-0 z-50 pointer-events-none">
            {currentToasts.map(toast => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>
    );
}

export const toast = {
    success: (message: string) => {
        toasts.push({ id: ++toastId, message, type: 'success' });
    },
    error: (message: string) => {
        toasts.push({ id: ++toastId, message, type: 'error' });
    },
    info: (message: string) => {
        toasts.push({ id: ++toastId, message, type: 'info' });
    },
};