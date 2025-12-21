import React from 'react';
import { Icon } from '../../../components/design-system';
import { User, Event } from 'common/schema';

interface PresenceModalProps {
    showPresenceModal: boolean;
    setShowPresenceModal: (show: boolean) => void;
    presentUsers: User[];
    currentUser: User | null;
    event: Event | null;
}

export function PresenceModal({
    showPresenceModal,
    setShowPresenceModal,
    presentUsers,
    currentUser,
    event,
}: PresenceModalProps) {
    if (!showPresenceModal) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300"
            onClick={() => setShowPresenceModal(false)}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-[var(--primary-500)] p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <Icon name="users" size={20} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">People Here</h3>
                                <p className="text-[var(--primary-100)] text-sm">
                                    {presentUsers.length} {presentUsers.length === 1 ? 'person' : 'people'} currently viewing
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowPresenceModal(false)}
                            className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
                        >
                            <Icon name="close" size={16} className="text-white" />
                        </button>
                    </div>
                </div>

                {/* User List */}
                <div className="max-h-96 overflow-y-auto">
                    <div className="p-6 space-y-3">
                        {presentUsers.map((user, index) => (
                            <div
                                key={user.id}
                                className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-200 animate-in slide-in-from-left duration-300"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="w-12 h-12 bg-[var(--primary-500)] rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-white font-bold text-lg">
                                        {user.firstName?.[0] || '?'}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-gray-900 font-semibold truncate">
                                        {user.firstName} {user.lastName}
                                    </p>
                                    {currentUser && user.id === currentUser.id && (
                                        <p className="text-[var(--primary-600)] text-sm font-medium">You</p>
                                    )}
                                    {event && user.id === event.hostId && currentUser && user.id !== currentUser.id && (
                                        <p className="text-[var(--primary-600)] text-sm font-medium">Host</p>
                                    )}
                                </div>
                                <div className="w-3 h-3 bg-[var(--primary-500)] rounded-full animate-pulse"></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                    <p className="text-center text-gray-600 text-sm">
                        Real-time presence • Updates automatically
                    </p>
                </div>
            </div>
        </div>
    );
}