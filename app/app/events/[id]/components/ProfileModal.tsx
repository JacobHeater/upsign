import { useEffect } from 'react';
import { Icon, AllergiesList } from '../../../components/design-system';
import { User, Event } from 'common/schema';

interface ProfileModalProps {
    showProfileModal: boolean;
    setShowProfileModal: (show: boolean) => void;
    selectedUser: User | null;
    currentUser: User | null;
    event: Event | null;
}

export function ProfileModal({
    showProfileModal,
    setShowProfileModal,
    selectedUser,
    currentUser,
    event,
}: ProfileModalProps) {
    useEffect(() => {
        if (showProfileModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        // Cleanup on unmount
        return () => {
            document.body.style.overflow = '';
        };
    }, [showProfileModal]);

    if (!showProfileModal || !selectedUser) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300"
            onClick={() => setShowProfileModal(false)}
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
                                <Icon name="user" size={20} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">{selectedUser.firstName} {selectedUser.lastName}</h3>
                                <p className="text-[var(--primary-100)] text-sm">
                                    {currentUser && selectedUser.id === currentUser.id
                                        ? 'You'
                                        : event && selectedUser.id === event.hostId
                                            ? 'Host'
                                            : 'Attendee'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowProfileModal(false)}
                            className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
                        >
                            <Icon name="close" size={16} className="text-white" />
                        </button>
                    </div>
                </div>

                {/* Profile Info */}
                <div className="max-h-96 overflow-y-auto">
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <p className="text-gray-900">{selectedUser.email}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <p className="text-gray-900">{selectedUser.phoneNumber}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Allergies</label>
                            <AllergiesList allergies={selectedUser.allergies?.map(a => a.allergy) || []} />
                        </div>
                        {selectedUser.lastLogin && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Login</label>
                                <p className="text-gray-900">{new Date(selectedUser.lastLogin).toLocaleString()}</p>
                            </div>
                        )}
                        {selectedUser.verified && (
                            <div className="flex items-center gap-2">
                                <Icon name="check" size={16} className="text-green-500" />
                                <span className="text-sm text-green-700">Verified Account</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                    <p className="text-center text-gray-600 text-sm">
                        User Profile
                    </p>
                </div>
            </div>
        </div>
    );
}