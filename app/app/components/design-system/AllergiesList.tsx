'use client';

import React from 'react';
import { Tag } from './Tag';

interface AllergiesListProps {
    allergies: string[];
    className?: string;
}

export function AllergiesList({ allergies, className }: AllergiesListProps) {
    if (allergies.length > 0) {
        return (
            <div className={`flex flex-wrap gap-1 ${className}`}>
                {allergies.map((allergy, index) => (
                    <Tag key={index} variant="accent">
                        {allergy}
                    </Tag>
                ))}
            </div>
        );
    } else {
        return <p className="text-gray-500 text-sm">No known allergies</p>;
    }
}