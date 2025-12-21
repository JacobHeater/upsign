import { Event, User, EventSegment, EventSegmentAttendee, EventSegmentAttendeeContribution } from 'common/schema';
import { Card, Button, Icon, Tag } from '../../../components/design-system';
import { AddContributionForm, EditContributionForm } from './forms';

interface EventSegmentsProps {
    event: Event;
    currentUser: User | null;
    canInteract: boolean;
    cancelled: boolean;
    joinSegment: (segmentId: string) => void;
    addContribution: (eventSegmentAttendeeId: string, item: string, description: string, quantity: number) => void;
    leaveSegment: (attendeeId: string) => void;
    deleteContribution: (contributionId: string) => void;
    updateContribution: (contributionId: string, item: string, description: string, quantity: number) => void;
    editingContributionId: string | null;
    setEditingContributionId: (id: string | null) => void;
}

export function EventSegments({
    event,
    currentUser,
    canInteract,
    cancelled,
    joinSegment,
    addContribution,
    leaveSegment,
    deleteContribution,
    updateContribution,
    editingContributionId,
    setEditingContributionId,
}: EventSegmentsProps) {
    if (!event.segments || event.segments.length === 0) return null;

    return (
        <div>
            <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-accent/20 backdrop-blur-sm border border-accent/30 rounded-full mb-6">
                    <Icon name="users" size={24} />
                    <span className="text-accent-foreground font-semibold">Event Segments</span>
                </div>
                <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">Choose Your Activities</h2>
                <p className="text-xl text-foreground/80">Join segments and see what everyone's bringing</p>
            </div>
            <div className="grid gap-8 grid-cols-1">
                {event.segments.map((segment: EventSegment, segmentIndex) => {
                    const isAttending = segment.attendees?.some((a) => a.userId === currentUser?.id);
                    const myAttendee = segment.attendees?.find((a) => a.userId === currentUser?.id);
                    return (
                        <Card key={segment.id} className="group relative overflow-hidden bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-md border border-white/20 hover:border-white/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary-500/10 animate-in slide-in-from-left duration-700" style={{ animationDelay: `${segmentIndex * 150}ms` }}>
                            {/* Background Pattern */}
                            <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 rounded-full blur-3xl"></div>
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/20 rounded-full blur-2xl"></div>
                            </div>

                            <div className="relative z-10">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-gradient-to-br from-primary-500/20 to-accent/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                            <span className='text-3xl'>📑</span>
                                        </div>
                                        <div>
                                            <h3 className="text-3xl font-bold text-foreground mb-1 group-hover:text-primary-500 transition-colors duration-300">
                                                {segment.name}
                                            </h3>
                                            <p className="text-foreground/70 text-sm">
                                                {segment.attendees?.length || 0} contributor{(segment.attendees?.length || 0) !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    {isAttending && (
                                        <div className="px-4 py-2 bg-primary-500/20 text-primary-500 rounded-full text-sm font-semibold border border-primary-500/30">
                                            ✓ Participating
                                        </div>
                                    )}
                                </div>

                                {/* Contributors */}
                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-8 h-8 bg-muted/50 rounded-lg flex items-center justify-center">
                                            <Icon name="users" size={16} className="text-foreground/70" />
                                        </div>
                                        <h4 className="text-xl font-semibold text-foreground">Contributors</h4>
                                    </div>
                                    {segment.attendees && segment.attendees.length > 0 ? (
                                        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                                            {segment.attendees.map((attendee: EventSegmentAttendee, attendeeIndex) => (
                                                <div key={attendee.id} className="group/attendee bg-gradient-to-r from-muted/30 to-muted/20 border border-muted/40 rounded-2xl p-5 hover:border-muted/60 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 animate-in fade-in slide-in-from-right duration-500" style={{ animationDelay: `${attendeeIndex * 100}ms` }}>
                                                    {/* Attendee Header */}
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-12 h-12 bg-gradient-to-br from-primary-500/20 to-accent/20 rounded-xl flex items-center justify-center group-hover/attendee:scale-105 transition-transform duration-300">
                                                                <Icon name="user" size={20} className="text-primary-500" />
                                                            </div>
                                                            <div>
                                                                <p className="text-foreground font-semibold text-lg leading-tight">
                                                                    {attendee.user?.firstName && attendee.user?.lastName
                                                                        ? `${attendee.user.firstName} ${attendee.user.lastName}`
                                                                        : 'Unknown User'}
                                                                    {currentUser && attendee.userId === currentUser.id && <span className="text-primary ml-1">(You)</span>}
                                                                </p>
                                                                {attendee.contributions && attendee.contributions.length > 0 && (
                                                                    <p className="text-foreground/60 text-sm">
                                                                        {attendee.contributions.length} item{attendee.contributions.length !== 1 ? 's' : ''}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Action Buttons */}
                                                        {currentUser && attendee.userId === currentUser.id && (
                                                            <Button
                                                                onClick={() => leaveSegment(attendee.id)}
                                                                variant="destructive"
                                                                size="sm"
                                                                className="px-3 py-1.5 text-xs opacity-100 md:opacity-0 md:group-hover/attendee:opacity-100 transition-opacity duration-300 hover:scale-105"
                                                                disabled={cancelled}
                                                            >
                                                                <Icon name="leave" size={14} />
                                                                Leave
                                                            </Button>
                                                        )}
                                                    </div>

                                                    {/* Contributions Grid */}
                                                    {attendee.contributions && attendee.contributions.length > 0 && (
                                                        <div className="space-y-3">
                                                            {attendee.contributions.map((contrib: EventSegmentAttendeeContribution) => (
                                                                editingContributionId === contrib.id ? (
                                                                    <EditContributionForm
                                                                        key={contrib.id}
                                                                        contribution={contrib}
                                                                        onUpdate={(item, desc, qty) => updateContribution(contrib.id, item, desc, qty)}
                                                                        onCancel={() => setEditingContributionId(null)}
                                                                    />
                                                                ) : (
                                                                    <div key={contrib.id} className="group/contrib bg-gradient-to-br from-primary-500/20 to-accent/20 border border-card/50 rounded-xl p-4 hover:border-card/70 hover:shadow-sm transition-all duration-300 hover:scale-[1.02]">
                                                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                                                            <div className="flex-1 min-w-0">
                                                                                <div className="flex items-center gap-2 mb-2">
                                                                                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                                                                                    <span className="font-semibold text-foreground text-base truncate group-hover/contrib:text-primary-500 transition-colors duration-300">{contrib.item}</span>
                                                                                    <Tag variant="accent" size="sm" className="font-bold flex-shrink-0">
                                                                                        × {contrib.quantity}
                                                                                    </Tag>
                                                                                </div>
                                                                                {contrib.description && (
                                                                                    <p className="text-foreground/80 text-sm ml-4 leading-relaxed group-hover/contrib:text-foreground/90 transition-colors duration-300">
                                                                                        {contrib.description}
                                                                                    </p>
                                                                                )}
                                                                            </div>

                                                                            {/* Edit/Delete Actions */}
                                                                            {currentUser && attendee.userId === currentUser.id && (
                                                                                <div className="flex gap-1 sm:ml-3 flex-shrink-0 justify-center sm:justify-end w-full sm:w-auto opacity-100 md:opacity-0 md:group-hover/contrib:opacity-100 transition-opacity duration-300">
                                                                                    <Button
                                                                                        onClick={() => setEditingContributionId(contrib.id)}
                                                                                        variant="ghost"
                                                                                        size="sm"
                                                                                        className="p-2 hover:bg-accent/20 rounded-full transition-colors text-foreground!"
                                                                                        disabled={cancelled}
                                                                                    >
                                                                                        <Icon name="edit" size={18} />
                                                                                    </Button>
                                                                                    <Button
                                                                                        onClick={() => deleteContribution(contrib.id)}
                                                                                        variant="ghost"
                                                                                        size="sm"
                                                                                        className="p-2 hover:bg-destructive/20 text-foreground! hover:text-destructive-500! rounded-full transition-colors"
                                                                                        disabled={cancelled}
                                                                                    >
                                                                                        <Icon name="trash" size={18} />
                                                                                    </Button>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Empty State */}
                                                    {(!attendee.contributions || attendee.contributions.length === 0) && (
                                                        <div className="text-center text-foreground/50">
                                                            <div className="w-12 h-12 bg-muted/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                                                                <Icon name="plus" size={20} className="opacity-50" />
                                                            </div>
                                                            <p className="text-sm font-medium">No contributions yet</p>
                                                            <p className="text-xs mt-1 opacity-70">Don't forget to add something!</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <div className="w-20 h-20 bg-muted/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                <Icon name="users" size={28} className="text-foreground" />
                                            </div>
                                            <p className="text-foreground/60 italic text-lg mb-2">No contributors yet</p>
                                            <p className="text-foreground/40 text-sm">Be the first to join {segment.name}!</p>
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/10">
                                    {currentUser && !isAttending && canInteract && !cancelled ? (
                                        <Button
                                            onClick={() => joinSegment(segment.id)}
                                            variant="primary"
                                            className="flex-1 text-lg py-3 hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-primary-500/25"
                                        >
                                            <Icon name="check" size={20} text={`Join ${segment.name}`} />
                                        </Button>
                                    ) : currentUser && isAttending && canInteract && !cancelled ? (
                                        <div className="flex flex-col gap-4 w-full">
                                            <AddContributionForm
                                                eventSegmentAttendeeId={myAttendee!.id}
                                                onAdd={(item, desc, qty) =>
                                                    addContribution(myAttendee!.id, item, desc, qty)
                                                }
                                                disabled={cancelled}
                                            />
                                            <Button
                                                onClick={() => leaveSegment(myAttendee!.id)}
                                                variant="accent"
                                                className="w-full text-lg hover:scale-105 transition-transform duration-300"
                                            >
                                                <Icon name="close" size={20} text={`Leave ${segment.name}`} />
                                            </Button>
                                        </div>
                                    ) : currentUser && !canInteract ? (
                                        <div className="text-center py-6 text-foreground/70 bg-muted/20 rounded-xl border border-muted/30">
                                            <Icon name="question" size={24} className="mx-auto mb-2 opacity-50" />
                                            <p className="text-sm">Accept the invitation to contribute</p>
                                        </div>
                                    ) : cancelled ? (
                                        <div className="text-center py-6 px-6 w-full text-foreground/70 bg-muted/20 rounded-xl border border-muted/30">
                                            <Icon name="close" size={24} className="mx-auto mb-2 opacity-50" />
                                            <p className="text-sm">This event has been cancelled</p>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}