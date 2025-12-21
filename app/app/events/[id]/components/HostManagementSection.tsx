import { User, EventInvitation } from 'common/schema';
import { Card, Button, Icon } from '../../../components/design-system';
import { SendInvitationForm } from './forms';

interface HostManagementSectionProps {
    currentUser: User | null;
    eventId: string;
    eventHostId: string;
    invitations: EventInvitation[];
    invitationError: string | null;
    sendInvitation: (phoneNumber: string, message: string) => void;
    withdrawInvitation: (invitationId: string) => void;
    cancelled: boolean;
}

export function HostManagementSection({
    currentUser,
    eventId,
    eventHostId,
    invitations,
    invitationError,
    sendInvitation,
    withdrawInvitation,
    cancelled,
}: HostManagementSectionProps) {
    if (!currentUser || eventHostId !== currentUser.id) return null;

    return (
        <div className="mt-12">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-foreground mb-2">Manage Event</h2>
                <p className="text-foreground/70">Invite guests and manage attendees</p>
            </div>

            <Card className="mb-8 bg-white/10 backdrop-blur-md border border-white/20" hoverEffect="none">
                <h3 className="text-2xl font-bold text-foreground mb-6">Send Invitations</h3>
                {invitationError && (
                    <div className="mb-4 p-3 bg-destructive/10 border-2 border-destructive/30 text-destructive rounded-lg text-sm">
                        {invitationError}
                    </div>
                )}
                <SendInvitationForm onSend={sendInvitation} disabled={cancelled} />
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border border-white/20" hoverEffect="none">
                <h3 className="text-2xl font-bold text-foreground mb-6">Pending Invitations</h3>
                {invitations.length > 0 ? (
                    <div className="space-y-4">
                        {invitations.map(invitation => (
                            <div key={invitation.id} className="bg-muted border border-muted rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-foreground font-semibold">
                                        To: {invitation.recipient.firstName} {invitation.recipient.lastName}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${invitation.rsvpStatus === 'Accepted' ? 'bg-green-100 text-green-800' :
                                            invitation.rsvpStatus === 'Declined' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {invitation.rsvpStatus}
                                        </span>
                                        {invitation.rsvpStatus === 'Pending' ? (
                                            <Button
                                                onClick={() => withdrawInvitation(invitation.id)}
                                                variant="destructive"
                                                size="sm"
                                                className="text-xs px-3 py-1"
                                                disabled={cancelled}
                                            >
                                                <Icon name="close" size={14} text="Withdraw" />
                                            </Button>
                                        ) : null}
                                    </div>
                                </div>
                                <p className="text-foreground/80 text-sm mb-2">{invitation.message}</p>
                                <p className="text-foreground/60 text-xs">
                                    Sent {new Date().toLocaleDateString()} {/* Placeholder, need to add sent date */}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-foreground/60 italic text-center py-4">No invitations sent yet</p>
                )}
            </Card>
        </div>
    );
}