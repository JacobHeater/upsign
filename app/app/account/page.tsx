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

            const updatedUser = await apiClient.getCurrentUser();
            if (updatedUser) {
                setUser(updatedUser);
            }
            setEditingAllergies(false);
            setAllergiesInput('');
        } catch (error) {
            console.error('Failed to update allergies:', error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-accent mx-auto mb-4"></div>
                    <p className="text-foreground text-lg">Loading your account...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-6">
                    <div className="text-6xl mb-4">🔒</div>
                    <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
                    <p className="text-foreground/80 mb-6">
                        You need to be logged in to view your account information.
                    </p>
                    <button
                        onClick={() => router.push('/account/login')}
                        className="bg-accent hover:bg-accent/90 text-accent-foreground px-6 py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-accent/50 border-2 border-accent hover:scale-105"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-6xl mx-auto px-6 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-block mb-4 px-4 py-2 bg-accent rounded-full shadow-lg">
                        <span className="text-accent-foreground font-bold text-sm">Account Dashboard</span>
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent mb-2">My Account</h1>
                    <p className="text-foreground/70">Manage your profile and preferences</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Profile Card */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-gradient-to-br from-card via-card to-primary/20 border-4 border-accent rounded-xl p-8 shadow-2xl">
                            <div className="flex items-center mb-6">
                                <div className="w-20 h-20 bg-gradient-to-br from-accent via-accent to-secondary rounded-full flex items-center justify-center text-3xl font-bold text-accent-foreground mr-4 shadow-xl border-4 border-accent">
                                    {user.firstName[0]}{user.lastName[0]}
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold text-accent">
                                        {user.firstName} {user.lastName}
                                    </h2>
                                    <p className="text-primary text-lg">{user.email}</p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="bg-primary/30 p-4 rounded-lg border-2 border-primary">
                                        <label className="block text-sm font-bold text-primary mb-2">
                                            📱 Phone Number
                                        </label>
                                        <p className="text-foreground font-semibold text-lg">
                                            {user.phoneNumber}
                                        </p>
                                    </div>
                                    <div className="bg-secondary/30 p-4 rounded-lg border-2 border-secondary">
                                        <label className="block text-sm font-bold text-secondary mb-2">
                                            🎂 Date of Birth
                                        </label>
                                        <p className="text-foreground font-semibold text-lg">
                                            {user.dateOfBirth.toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-accent/20 p-4 rounded-lg border-2 border-accent">
                                        <label className="block text-sm font-bold text-accent mb-3">
                                            ⚡ Account Status
                                        </label>
                                        <div className="flex flex-col gap-2">
                                            <span className={`px-4 py-2 rounded-lg text-sm font-bold shadow-md border-2 ${user.verified
                                                ? 'bg-primary text-primary-foreground border-primary'
                                                : 'bg-accent text-accent-foreground border-accent'
                                                }`}>
                                                {user.verified ? '✓ Verified' : '⚠ Unverified'}
                                            </span>
                                            <span className={`px-4 py-2 rounded-lg text-sm font-bold shadow-md border-2 ${user.locked
                                                ? 'bg-destructive text-destructive-foreground border-destructive'
                                                : 'bg-primary text-primary-foreground border-primary'
                                                }`}>
                                                {user.locked ? '🔒 Locked' : '✓ Active'}
                                            </span>
                                        </div>
                                    </div>
                                    {user.lastLogin && (
                                        <div className="bg-muted/40 p-4 rounded-lg border-2 border-muted">
                                            <label className="block text-sm font-bold text-muted mb-2">
                                                🕐 Last Login
                                            </label>
                                            <p className="text-foreground font-semibold">
                                                {new Date(user.lastLogin).toLocaleString()}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Allergies Card */}
                        <div className="bg-gradient-to-br from-card to-secondary/20 border-4 border-secondary rounded-xl p-8 shadow-2xl">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-2xl font-bold text-secondary">🥜 Allergies & Dietary Restrictions</h3>
                                {!editingAllergies && (
                                    <button
                                        onClick={handleEditAllergies}
                                        className="text-accent-foreground bg-accent hover:bg-accent/90 text-sm font-bold transition-all px-4 py-2 border-2 border-accent rounded-lg shadow-md hover:scale-105"
                                    >
                                        {user?.allergies && user.allergies.length > 0 ? '✏️ Edit' : '➕ Add'}
                                    </button>
                                )}
                            </div>

                            {editingAllergies ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-foreground mb-2">
                                            List your allergies (separate with commas)
                                        </label>
                                        <textarea
                                            value={allergiesInput}
                                            onChange={(e) => setAllergiesInput(e.target.value)}
                                            placeholder="e.g. peanuts, dairy, gluten"
                                            className="w-full bg-input text-foreground border-4 border-accent px-4 py-3 rounded-lg focus:border-secondary focus:outline-none resize-none font-medium"
                                            rows={3}
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleSaveAllergies}
                                            disabled={saving}
                                            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-primary/50 border-2 border-primary hover:scale-105"
                                        >
                                            {saving ? 'Saving...' : '💾 Save Changes'}
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            disabled={saving}
                                            className="bg-muted hover:bg-muted/80 border-2 border-muted text-muted-foreground px-6 py-3 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                                        >
                                            ❌ Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : user?.allergies && user.allergies.length > 0 ? (
                                <div className="flex flex-wrap gap-3">
                                    {user.allergies.map((allergy, index) => (
                                        <span
                                            key={index}
                                            className="bg-gradient-to-r from-destructive to-secondary text-foreground px-5 py-3 rounded-lg text-base font-bold border-3 border-destructive shadow-lg"
                                        >
                                            ⚠️ {allergy.allergy}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-foreground/70 text-sm italic">
                                    No allergies recorded. Click "Add" to specify any allergies or dietary restrictions.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Actions Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-card to-accent/20 border-4 border-accent rounded-xl p-6 shadow-2xl">
                            <h3 className="text-2xl font-bold text-accent mb-6">⚡ Quick Actions</h3>
                            <div className="space-y-4">
                                <button
                                    onClick={() => router.push('/events')}
                                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-4 rounded-lg font-bold transition-all text-left shadow-xl hover:shadow-primary/50 hover:scale-110 border-3 border-primary text-lg"
                                >
                                    📅 View My Events
                                </button>
                                <button
                                    onClick={() => router.push('/events/create')}
                                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground px-5 py-4 rounded-lg font-bold transition-all text-left shadow-xl hover:shadow-accent/50 hover:scale-110 border-3 border-accent text-lg"
                                >
                                    ➕ Create Event
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground px-5 py-4 rounded-lg font-bold transition-all text-left shadow-xl hover:shadow-destructive/50 hover:scale-110 border-3 border-destructive text-lg"
                                >
                                    🚪 Logout
                                </button>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-card to-muted/20 border-4 border-muted rounded-xl p-6 shadow-xl">
                            <h3 className="text-xl font-bold text-secondary mb-3">⚙️ Account Settings</h3>
                            <p className="text-foreground text-sm">
                                Need to update your information? Contact support for account modifications.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
