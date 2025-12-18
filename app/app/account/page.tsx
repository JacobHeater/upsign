'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import type { User } from 'common/schema';

export default function AccountPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [editingAllergies, setEditingAllergies] = useState(false);
    const [allergiesInput, setAllergiesInput] = useState('');
    const [saving, setSaving] = useState(false);
    const { logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        apiClient
            .getCurrentUser()
            .then(setUser)
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);

    const handleLogout = async () => {
        await logout();
        router.push('/account/login');
    };

    const handleEditAllergies = () => {
        setAllergiesInput(user?.allergies?.map(a => a.allergy).join(', ') || '');
        setEditingAllergies(true);
    };

    const handleCancelEdit = () => {
        setEditingAllergies(false);
        setAllergiesInput('');
    };

    const handleSaveAllergies = async () => {
        if (!user) return;

        setSaving(true);
        try {
            const allergies = allergiesInput
                .split(',')
                .map(a => a.trim())
                .filter(a => a.length > 0)
                .map(allergy => ({ allergy }));

            await apiClient.updateUser(user.id, { allergies } as any);

            // Refetch user data to get updated allergies
            const updatedUser = await apiClient.getCurrentUser();
            if (updatedUser) {
                setUser(updatedUser);
            }
            setEditingAllergies(false);
            setAllergiesInput('');
        } catch (error) {
            console.error('Failed to update allergies:', error);
            // You could add error handling UI here
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-ink-black flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-peach-glow mx-auto mb-4"></div>
                    <p className="text-peach-glow text-lg">Loading your account...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-ink-black flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-6">
                    <div className="text-6xl mb-4">🔒</div>
                    <h1 className="text-2xl font-bold text-peach-glow mb-4">Access Denied</h1>
                    <p className="text-peach-glow/80 mb-6">
                        You need to be logged in to view your account information.
                    </p>
                    <button
                        onClick={() => router.push('/account/login')}
                        className="bg-racing-red hover:bg-racing-red/80 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-ink-black">
            <div className="max-w-6xl mx-auto px-6 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-peach-glow mb-2">My Account</h1>
                    <p className="text-peach-glow/70">Manage your profile and preferences</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Profile Card */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-jungle-teal/10 border border-jungle-teal/20 rounded-lg p-8">
                            <div className="flex items-center mb-6">
                                <div className="w-16 h-16 bg-racing-red rounded-full flex items-center justify-center text-2xl font-bold text-white mr-4">
                                    {user.firstName[0]}{user.lastName[0]}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-peach-glow">
                                        {user.firstName} {user.lastName}
                                    </h2>
                                    <p className="text-peach-glow/70">{user.email}</p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-peach-glow/70 mb-1">
                                            Phone Number
                                        </label>
                                        <p className="text-peach-glow bg-ink-black/50 px-3 py-2 rounded-lg">
                                            {user.phoneNumber}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-peach-glow/70 mb-1">
                                            Date of Birth
                                        </label>
                                        <p className="text-peach-glow bg-ink-black/50 px-3 py-2 rounded-lg">
                                            {user.dateOfBirth.toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-peach-glow/70 mb-1">
                                            Account Status
                                        </label>
                                        <div className="flex gap-2">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${user.verified
                                                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                                }`}>
                                                {user.verified ? '✓ Verified' : '⚠ Unverified'}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${user.locked
                                                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                : 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                }`}>
                                                {user.locked ? '🔒 Locked' : '✓ Active'}
                                            </span>
                                        </div>
                                    </div>
                                    {user.lastLogin && (
                                        <div>
                                            <label className="block text-sm font-medium text-peach-glow/70 mb-1">
                                                Last Login
                                            </label>
                                            <p className="text-peach-glow bg-ink-black/50 px-3 py-2 rounded-lg">
                                                {new Date(user.lastLogin).toLocaleString()}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Allergies Card */}
                        <div className="bg-jungle-teal/10 border border-jungle-teal/20 rounded-lg p-8">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-peach-glow">Allergies & Dietary Restrictions</h3>
                                {!editingAllergies && (
                                    <button
                                        onClick={handleEditAllergies}
                                        className="text-peach-glow/70 hover:text-peach-glow text-sm font-medium transition-colors"
                                    >
                                        {user?.allergies && user.allergies.length > 0 ? '✏️ Edit' : '➕ Add'}
                                    </button>
                                )}
                            </div>

                            {editingAllergies ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-peach-glow/70 mb-2">
                                            List your allergies (separate with commas)
                                        </label>
                                        <textarea
                                            value={allergiesInput}
                                            onChange={(e) => setAllergiesInput(e.target.value)}
                                            placeholder="e.g. peanuts, dairy, gluten"
                                            className="w-full border border-jungle-teal/20 px-4 py-3 rounded-lg focus:border-jungle-teal focus:outline-none resize-none"
                                            rows={3}
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleSaveAllergies}
                                            disabled={saving}
                                            className="bg-jungle-teal hover:bg-jungle-teal/80 text-ink-black px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {saving ? 'Saving...' : 'Save Changes'}
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            disabled={saving}
                                            className="bg-ink-black/50 hover:bg-ink-black/70 border border-jungle-teal/20 text-peach-glow px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : user?.allergies && user.allergies.length > 0 ? (
                                <div className="flex flex-wrap gap-3">
                                    {user.allergies.map((allergy, index) => (
                                        <span
                                            key={index}
                                            className="bg-racing-red/10 text-racing-red px-4 py-2 rounded-lg text-sm font-medium border border-racing-red/20"
                                        >
                                            {allergy.allergy}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-peach-glow/70 text-sm">
                                    No allergies recorded. Click "Add" to specify any allergies or dietary restrictions.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Actions Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-jungle-teal/10 border border-jungle-teal/20 rounded-lg p-6">
                            <h3 className="text-xl font-bold text-peach-glow mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                <button
                                    onClick={() => router.push('/events')}
                                    className="w-full bg-jungle-teal hover:bg-jungle-teal/80 text-ink-black px-4 py-3 rounded-lg font-medium transition-colors text-left"
                                >
                                    📅 View My Events
                                </button>
                                <button
                                    onClick={() => router.push('/events/create')}
                                    className="w-full bg-peach-glow hover:bg-peach-glow/80 text-ink-black px-4 py-3 rounded-lg font-medium transition-colors text-left"
                                >
                                    ➕ Create Event
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="w-full bg-racing-red hover:bg-racing-red/80 text-white px-4 py-3 rounded-lg font-medium transition-colors text-left"
                                >
                                    🚪 Logout
                                </button>
                            </div>
                        </div>

                        <div className="bg-jungle-teal/5 border border-jungle-teal/10 rounded-lg p-6">
                            <h3 className="text-lg font-bold text-peach-glow mb-2">Account Settings</h3>
                            <p className="text-peach-glow/70 text-sm">
                                Need to update your information? Contact support for account modifications.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
