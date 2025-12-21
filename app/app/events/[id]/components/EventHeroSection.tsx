import { Event, User } from 'common/schema';
import { Icon } from '../../../components/design-system';

interface EventHeroSectionProps {
    event: Event;
    presentUsers: User[];
    onPresenceClick: () => void;
}

export function EventHeroSection({ event, presentUsers, onPresenceClick }: EventHeroSectionProps) {
    return (
        <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-accent/20 backdrop-blur-sm border border-accent/30 rounded-full mb-6">
                <span className="text-2xl">{event.icon}</span>
                <span className="text-accent-foreground font-semibold">Event Details</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-foreground mb-4">{event.name}</h1>
            <p className="text-xl text-foreground/80 mb-4">Join the fun and see who's bringing what</p>

            {/* Presence Indicator */}
            {presentUsers.length > 0 && (
                <div
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary-500)]/20 backdrop-blur-sm border border-[var(--primary-500)]/30 rounded-full animate-in fade-in duration-500 cursor-pointer hover:bg-[var(--primary-500)]/30 transition-all duration-200 hover:scale-105"
                    onClick={onPresenceClick}
                >
                    <div className="flex -space-x-2">
                        {presentUsers.slice(0, 3).map((user, index) => (
                            <div
                                key={user.id}
                                className="w-6 h-6 bg-[var(--primary-500)] rounded-full border-2 border-white flex items-center justify-center animate-in slide-in-from-left duration-300"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <span className="text-xs text-white font-bold">
                                    {user.firstName?.[0] || '?'}
                                </span>
                            </div>
                        ))}
                        {presentUsers.length > 3 && (
                            <div className="w-6 h-6 bg-[var(--primary-500)]/80 rounded-full border-2 border-white flex items-center justify-center">
                                <span className="text-xs text-white font-bold">+{presentUsers.length - 3}</span>
                            </div>
                        )}
                    </div>
                    <span className="text-[var(--primary-700)] font-medium">
                        {presentUsers.length === 1 ? '1 person here' : `${presentUsers.length} people here`}
                    </span>
                </div>
            )}
        </div>
    );
}