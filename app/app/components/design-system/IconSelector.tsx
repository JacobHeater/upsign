'use client';

import React, { useState, useRef, useEffect } from 'react';

interface IconSelectorProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

const EVENT_ICONS = [
    { value: '🎉', label: 'Party Popper' },
    { value: '🎂', label: 'Birthday Cake' },
    { value: '🍕', label: 'Pizza' },
    { value: '🎵', label: 'Music Note' },
    { value: '🎤', label: 'Microphone' },
    { value: '🎨', label: 'Artist Palette' },
    { value: '⚽', label: 'Soccer Ball' },
    { value: '🏀', label: 'Basketball' },
    { value: '🎾', label: 'Tennis' },
    { value: '🏈', label: 'Football' },
    { value: '🏐', label: 'Volleyball' },
    { value: '🎯', label: 'Bullseye' },
    { value: '🎪', label: 'Circus Tent' },
    { value: '🎭', label: 'Performing Arts' },
    { value: '🎊', label: 'Confetti Ball' },
    { value: '🥂', label: 'Champagne' },
    { value: '🍻', label: 'Beer Mug' },
    { value: '☕', label: 'Coffee' },
    { value: '🍽️', label: 'Fork and Knife' },
    { value: '🎁', label: 'Gift' },
    { value: '📅', label: 'Calendar' },
    { value: '🏆', label: 'Trophy' },
    { value: '🎮', label: 'Video Game' },
    { value: '🎬', label: 'Clapper Board' },
    { value: '📚', label: 'Books' },
    { value: '🌟', label: 'Star' },
    { value: '🔥', label: 'Fire' },
    { value: '💫', label: 'Dizzy' },
    { value: '✨', label: 'Sparkles' },
    // Holiday Icons
    { value: '🎄', label: 'Christmas Tree' },
    { value: '🎅', label: 'Santa Claus' },
    { value: '🦌', label: 'Reindeer' },
    { value: '❄️', label: 'Snowflake' },
    { value: '🔔', label: 'Bell' },
    { value: '🕎', label: 'Menorah' },
    { value: '🕉️', label: 'Om' },
    { value: '🕌', label: 'Mosque' },
    { value: '⛪', label: 'Church' },
    { value: '🕍', label: 'Synagogue' },
    { value: '🎃', label: 'Jack-O\'-Lantern' },
    { value: '👻', label: 'Ghost' },
    { value: '🦇', label: 'Bat' },
    { value: '🕷️', label: 'Spider' },
    { value: '🦃', label: 'Turkey' },
    { value: '🥧', label: 'Pie' },
    { value: '🌽', label: 'Corn' },
    { value: '🥚', label: 'Egg' },
    { value: '🐰', label: 'Rabbit' },
    { value: '🌷', label: 'Tulip' },
    { value: '🍀', label: 'Four Leaf Clover' },
    { value: '☘️', label: 'Shamrock' },
    { value: '🎆', label: 'Fireworks' },
    { value: '🎇', label: 'Sparkler' },
    { value: '🗽', label: 'Statue of Liberty' },
    { value: '🎈', label: 'Balloon' },
] as const;

export const IconSelector: React.FC<IconSelectorProps> = ({
    value,
    onChange,
    className = '',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedIcon = EVENT_ICONS.find(icon => icon.value === value);

    const filteredIcons = EVENT_ICONS.filter(icon =>
        icon.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchQuery('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (iconValue: string) => {
        onChange(iconValue);
        setIsOpen(false);
        setSearchQuery('');
    };

    const handleToggle = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setSearchQuery('');
        }
    };

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <button
                type="button"
                onClick={handleToggle}
                className="w-full px-3 py-2 border border-input rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent flex items-center justify-between cursor-pointer"
            >
                <span>{selectedIcon ? `${selectedIcon.value} ${selectedIcon.label}` : 'Select an icon'}</span>
                <svg
                    className={`w-4 h-4 text-foreground/60 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-input border border-input rounded-md shadow-lg">
                    <input
                        type="text"
                        placeholder="Search icons..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-3 py-2 border-b border-input bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <ul className="max-h-60 overflow-y-auto">
                        {filteredIcons.map((icon) => (
                            <li
                                key={icon.value}
                                onClick={() => handleSelect(icon.value)}
                                className="px-3 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer"
                            >
                                {icon.value} {icon.label}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default IconSelector;