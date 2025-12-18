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
                    <div className="inline-block mb-4 px-4 py-2 bg-accent/10 border-2 border-accent/30 rounded-full">
                        <span className="text-accent font-semibold text-sm">Account Dashboard</span>
                    </div>
                    <h1 className="text-4xl font-bold text-foreground mb-2">My Account</h1>
                    <p className="text-foreground/70">Manage your profile and preferences</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Profile Card */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-card border-2 border-primary/30 rounded-xl p-8 shadow-lg hover:shadow-primary/30 transition-all">
                            <div className="flex items-center mb-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent/80 rounded-full flex items-center justify-center text-2xl font-bold text-accent-foreground mr-4 shadow-lg border-2 border-accent">
                                    {user.firstName[0]}{user.lastName[0]}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-foreground">
                                        {user.firstName} {user.lastName}
                                    </h2>
                                    <p className="text-foreground/70">{user.email}</p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground/70 mb-1">
                                            Phone Number
                                        </label>
                                        <p className="text-foreground bg-background/80 px-3 py-2 rounded-lg border border-border">
                                            {user.phoneNumber}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground/70 mb-1">
                                            Date of Birth
                                        </label>
                                        <p className="text-foreground bg-background/80 px-3 py-2 rounded-lg border border-border">
                                            {user.dateOfBirth.toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground/70 mb-1">
                                            Account Status
                                        </label>
                                        <div className="flex gap-2">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium border-2 ${user.verified
                                                ? 'bg-primary/10 text-primary border-primary/30'
                                                : 'bg-accent/10 text-accent border-accent/30'
                                                }`}>
                                                {user.verified ? '✓ Verified' : '⚠ Unverified'}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium border-2 ${user.locked
                                                ? 'bg-destructive/10 text-destructive border-destructive/30'
                                                : 'bg-primary/10 text-primary border-primary/30'
                                                }`}>
                                                {user.locked ? '🔒 Locked' : '✓ Active'}
                                            </span>
                                        </div>
                                    </div>
                                    {user.lastLogin && (
                                        <div>
                                            <label className="block text-sm font-medium text-foreground/70 mb-1">
                                                Last Login
                                            </label>
                                            <p className="text-foreground bg-background/80 px-3 py-2 rounded-lg border border-border">
                                                {new Date(user.lastLogin).toLocaleString()}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Allergies Card */}
                        <div className="bg-card border-2 border-secondary/30 rounded-xl p-8 shadow-lg hover:shadow-secondary/30 transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-foreground">Allergies & Dietary Restrictions</h3>
                                {!editingAllergies && (
                                    <button
                                        onClick={handleEditAllergies}
                                        className="text-accent hover:text-accent/80 text-sm font-medium transition-colors px-3 py-1 border border-accent/30 rounded-lg hover:bg-accent/10"
                                    >
                                        {user?.allergies && user.allergies.length > 0 ? '✏️ Edit' : '➕ Add'}
                                    </button>
                                )}
                            </div>

                            {editingAllergies ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground/70 mb-2">
                                            List your allergies (separate with commas)
                                        </label>
                                        <textarea
                                            value={allergiesInput}
                                            onChange={(e) => setAllergiesInput(e.target.value)}
                                            placeholder="e.g. peanuts, dairy, gluten"
                                            className="w-full bg-input text-foreground border-2 border-border px-4 py-3 rounded-lg focus:border-ring focus:outline-none resize-none"
                                            rows={3}
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleSaveAllergies}
                                            disabled={saving}
                                            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-primary/50 border-2 border-primary"
                                        >
                                            {saving ? 'Saving...' : 'Save Changes'}
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            disabled={saving}
                                            className="bg-card hover:bg-muted/30 border-2 border-border text-foreground px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                                            className="bg-secondary/20 text-secondary-foreground px-4 py-2 rounded-lg text-sm font-medium border-2 border-secondary/40 shadow-sm"
                                        >
                                            {allergy.allergy}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-foreground/70 text-sm">
                                    No allergies recorded. Click "Add" to specify any allergies or dietary restrictions.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Actions Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-card border-2 border-accent/30 rounded-xl p-6 shadow-lg hover:shadow-accent/30 transition-all">
                            <h3 className="text-xl font-bold text-foreground mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                <button
                                    onClick={() => router.push('/events')}
                                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-3 rounded-lg font-medium transition-all text-left shadow-md hover:shadow-primary/50 hover:scale-105 border-2 border-primary"
                                >
                                    📅 View My Events
                                </button>
                                <button
                                    onClick={() => router.push('/events/create')}
                                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground px-4 py-3 rounded-lg font-medium transition-all text-left shadow-md hover:shadow-accent/50 hover:scale-105 border-2 border-accent"
                                >
                                    ➕ Create Event
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground px-4 py-3 rounded-lg font-medium transition-all text-left shadow-md hover:shadow-destructive/50 hover:scale-105 border-2 border-destructive"
                                >
                                    🚪 Logout
                                </button>
                            </div>
                        </div>

                        <div className="bg-card border-2 border-muted/30 rounded-xl p-6 shadow-md">
                            <h3 className="text-lg font-bold text-foreground mb-2">Account Settings</h3>
                            <p className="text-foreground/70 text-sm">
                                Need to update your information? Contact support for account modifications.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
