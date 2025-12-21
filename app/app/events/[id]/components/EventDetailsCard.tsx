import { Event, User } from 'common/schema';
import { Card, AllergiesList } from '../../../components/design-system';

interface EventDetailsCardProps {
    event: Event;
    currentUser: User | null;
}

export function EventDetailsCard({ event, currentUser }: EventDetailsCardProps) {
    return (
        <Card className="mb-8 bg-white/10 backdrop-blur-md border border-white/20" hoverEffect="none">
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Event Information</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center bg-muted rounded-lg p-4">
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <span className='text-4xl'>🗓️</span>
                        <h3 className="text-lg font-semibold text-foreground">Date & Time</h3>
                    </div>
                    <p className="text-foreground/90 text-lg" style={{ textDecoration: event.cancelled ? 'line-through' : 'none' }}>
                        {new Date(event.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </p>
                    <p className="text-foreground/70 mt-1" style={{ textDecoration: event.cancelled ? 'line-through' : 'none' }}>
                        {new Date(event.date).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                        })}
                    </p>
                </div>

                <div className="text-center bg-muted rounded-lg p-4">
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <span className='text-4xl'>📍</span>
                        <h3 className="text-lg font-semibold text-foreground">Location</h3>
                    </div>
                    <p className="text-foreground/90 text-lg">{event.location}</p>
                </div>

                <div className="text-center bg-muted rounded-lg p-4">
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <span className='text-4xl'>👑</span>
                        <h3 className="text-lg font-semibold text-foreground">Host</h3>
                    </div>
                    <p className="text-foreground/90 text-lg">
                        {currentUser && event.hostId === currentUser.id
                            ? `${currentUser.firstName} ${currentUser.lastName} (You)`
                            : `${event.host?.firstName} ${event.host?.lastName}`}
                    </p>
                </div>

                <div className="text-center bg-muted rounded-lg p-4">
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <span className='text-4xl'>🥜</span>
                        <h3 className="text-lg font-semibold text-foreground">Allergies</h3>
                    </div>
                    {(() => {
                        const allUsers = [event.host, ...(event.attendees?.map(a => a.user) || [])];
                        const allAllergies = allUsers.flatMap(u => u.allergies || []).map(a => a.allergy);
                        const uniqueAllergies = [...new Set(allAllergies)];
                        return <AllergiesList allergies={uniqueAllergies} className='justify-center' />;
                    })()}
                </div>
            </div>
        </Card>
    );
}