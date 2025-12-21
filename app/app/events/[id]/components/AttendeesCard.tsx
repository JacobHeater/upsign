import { Event, User, EventAttendee } from 'common/schema';
import { Card, Tag, Icon, Button } from '../../../components/design-system';

interface AttendeesCardProps {
    event: Event;
    currentUser: User | null;
    presentUsers: User[];
    onUserClick: (user: User) => void;
    onRemoveAttendee?: (userId: string) => void;
    cancelled: boolean;
}

export function AttendeesCard({ event, currentUser, presentUsers, onUserClick, onRemoveAttendee, cancelled }: AttendeesCardProps) {
    return (
        <Card className="mb-8 bg-white/10 backdrop-blur-md border border-white/20" hoverEffect="none">
            <h3 className="text-2xl text-center font-bold text-foreground mb-6 pb-4">Attendees</h3>
            {event.attendees && event.attendees.length > 0 ? (
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {[event.host, ...event.attendees].map((att, index) => {
                        const user = 'user' in att ? att.user : att;
                        const isPresent = presentUsers.some(p => p.id === user.id);
                        const segmentsCount = event.segments?.filter(s => s.attendees?.some(a => a.userId === user.id)).length || 0;
                        const isHost = event.hostId === user.id;
                        const isCurrentUser = currentUser?.id === user.id;

                        return (
                            <div
                                key={user.id}
                                className="group bg-muted/50 rounded-xl p-4 hover:bg-muted/70 hover:ring-2 hover:ring-primary-500/20 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4 duration-500 relative"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >

                                <div className="flex flex-col items-center text-center space-y-3">
                                    {/* Avatar */}
                                    <div className="relative cursor-pointer" onClick={() => onUserClick(user)}>
                                        <div className={'w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 bg-primary-500 text-white shadow-lg hover:bg-primary-600'}>
                                            {user.firstName?.[0] || '?'}
                                            {user.lastName?.[0] || ''}
                                        </div>

                                        {/* Presence Indicator */}
                                        {isPresent && (
                                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full animate-pulse">
                                                <div className="w-full h-full bg-green-500 rounded-full animate-ping"></div>
                                            </div>
                                        )}

                                        {/* Host Crown */}
                                        {isHost && (
                                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent-200 rounded-full flex items-center justify-center shadow-md">
                                                <span className="text-white text-xs">👑</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Name and Status */}
                                    <div className="space-y-1">
                                        <p className="text-foreground font-semibold text-lg leading-tight">
                                            {user.firstName} {user.lastName}
                                            {isCurrentUser && <span className="text-primary ml-1">(You)</span>}
                                        </p>

                                        {/* Badges */}
                                        <div className="flex flex-wrap justify-center gap-1">
                                            {isHost && (
                                                <Tag variant="accent" size="sm" className="text-xs px-2 py-0.5">
                                                    Host
                                                </Tag>
                                            )}
                                            {isPresent && (
                                                <Tag variant="primary" size="sm" className="text-xs px-2 py-0.5 bg-green-100 text-green-800">
                                                    Online
                                                </Tag>
                                            )}
                                            {segmentsCount > 0 && (
                                                <Tag variant="secondary" size="sm" className="text-xs px-2 py-0.5">
                                                    {segmentsCount} segment{segmentsCount !== 1 ? 's' : ''}
                                                </Tag>
                                            )}
                                        </div>
                                        {/* Remove button for host - positioned below presence indicator */}
                                        {onRemoveAttendee && currentUser && currentUser.id === event.hostId && user.id !== currentUser.id && (
                                            <div className='mt-3'>
                                                <Button
                                                    variant="destructive"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onRemoveAttendee(user.id);
                                                    }}
                                                    className="mx-auto w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center lg:opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md"
                                                    title="Remove attendee"
                                                    disabled={cancelled}
                                                >
                                                    <Icon name="trash" size={12} />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center pb-4">
                    <div className="w-24 h-24 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon name="users" size={32} className="text-foreground" />
                    </div>
                    <p className="text-foreground/60 italic text-lg">It's a little quiet in here.</p>
                    {currentUser && currentUser.id === event.hostId && (
                        <p className="text-foreground/60 italic text-lg">Why don't you invite someone?</p>
                    )}
                </div>
            )}
        </Card>
    );
}