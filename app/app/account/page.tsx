'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../lib/api';
import { useAuth } from '../lib/auth-context';
import type { User } from 'common/schema';
import Link from 'next/link';
import { Button, Card, Textarea, Input, IconButton, Tag, Icon } from '@/components/design-system';

export default function AccountPage() {
    const [editingAllergies, setEditingAllergies] = useState(false);
    const [editingAllergiesList, setEditingAllergiesList] = useState<string[]>([]);
    const { user, loading, logout, refreshUser } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.push('/account/login');
    };

    const handleEditAllergies = () => {
        setEditingAllergiesList(user?.allergies?.map(a => a.allergy) || []);
        setEditingAllergies(true);
    };

    const handleCancelEdit = () => {
        setEditingAllergies(false);
        setEditingAllergiesList([]);
    };

    const handleSaveAllergies = async () => {
        if (!user) return;

        try {
            const allergies = editingAllergiesList
                .filter(a => a.trim().length > 0)
                .map(allergy => ({ allergy }));

            await apiClient.updateUser(user.id, { allergies } as any);

            await refreshUser(); // Refresh the user data from auth context
            setEditingAllergies(false);
            setEditingAllergiesList([]);
        } catch (error) {
            console.error('Failed to update allergies:', error);
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
                    <Button href="/account/login" variant="accent" className="px-6 py-3">Go to Login</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-secondary py-12">
            <div className="max-w-6xl mx-auto px-6 py-12">
                {/* Header */}
                <div className="text-center mb-12 glass-header">
                    <div className="inline-flex items-center gap-3 mb-4 px-4 py-2 glass-header-pill">
                        <span className="w-2 h-2 rounded-full bg-accent inline-block" />
                        <span className="font-bold text-sm text-foreground">Account Dashboard</span>
                        <div className="ml-2 px-2 py-0.5 rounded-full bg-secondary inline-block border border-foreground">
                            <span className="text-xs font-semibold text-foreground">Member</span>
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold mb-2">My Account</h1>
                    <div className="glass-divider" />
                    <p className="text-foreground">Manage your profile and preferences</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Profile Card */}
                    <div className="lg:col-span-2 space-y-8">
                        <Card className="relative rounded-xl p-8 overflow-hidden" size="lg" hoverEffect="none">
                            <div className="absolute -right-10 -top-10 w-60 h-60 rounded-full glass-blob pointer-events-none" />
                            <div className="flex items-center mb-6">
                                <div className="w-20 h-20 glass-avatar rounded-full flex items-center justify-center text-3xl font-bold text-foreground mr-4">
                                    {/* User initials */}
                                    {user?.firstName[0]}{user?.lastName[0]}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-foreground">{user?.firstName} {user?.lastName}</h2>
                                    <p className="text-sm text-foreground/70">{user?.email}</p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="glass-info">
                                        <p className="text-sm font-semibold text-foreground">Phone Number</p>
                                        <p className="text-lg text-foreground">{user?.phoneNumber}</p>
                                    </div>
                                    <div className="glass-info">
                                        <p className="text-sm font-semibold text-foreground">Date of Birth</p>
                                        <p className="text-lg text-foreground">{user?.dateOfBirth?.toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="glass-info">
                                        <p className="text-sm font-semibold text-foreground">Account Status</p>
                                        <p className="text-lg text-foreground flex items-center gap-2">
                                            {user?.verified ? (
                                                <>
                                                    Verified
                                                    <Icon name="check" size={20} className="text-green-500" />
                                                </>
                                            ) : (
                                                'Unverified'
                                            )}
                                        </p>
                                    </div>
                                    <div className="glass-info">
                                        <p className="text-sm font-semibold text-foreground">Last Login</p>
                                        <p className="text-lg text-foreground">{user?.lastLogin?.toISOString()}</p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Allergies Card */}
                        <Card className="rounded-xl p-8 relative" size="sm" hoverEffect="none">
                            <div className="absolute left-6 top-6 w-24 h-24 rounded-full glass-blob-sm -z-10" />
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-2xl font-bold text-foreground">🥜 Allergies & Dietary Restrictions</h3>
                                {!editingAllergies && (
                                    <Button onClick={handleEditAllergies} variant="primary" size="sm" className="glass-btn">Edit</Button>
                                )}
                            </div>

                            {editingAllergies ? (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        {editingAllergiesList.map((allergy, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <Input
                                                    value={allergy}
                                                    onChange={(e) => {
                                                        const newList = [...editingAllergiesList];
                                                        newList[index] = e.target.value;
                                                        setEditingAllergiesList(newList);
                                                    }}
                                                    placeholder="Allergy"
                                                    className="flex-1"
                                                />
                                                <IconButton
                                                    onClick={() => {
                                                        const newList = editingAllergiesList.filter((_, i) => i !== index);
                                                        setEditingAllergiesList(newList);
                                                    }}
                                                    variant="destructive"
                                                    size="sm"
                                                    icon="trash"
                                                />
                                            </div>
                                        ))}
                                        <Button
                                            onClick={() => setEditingAllergiesList([...editingAllergiesList, ''])}
                                            variant="primary"
                                            size="sm"
                                            className="glass-btn"
                                        >
                                            + Add Allergy
                                        </Button>
                                    </div>
                                    <div className="flex gap-4 w-full lg:col-span-3">
                                        <Button onClick={handleSaveAllergies} variant="primary" className="glass-btn flex-1">Save</Button>
                                        <Button onClick={handleCancelEdit} variant="accent" className="glass-btn flex-1">Cancel</Button>
                                    </div>
                                </div>
                            ) : user?.allergies && user.allergies.length > 0 ? (
                                <div className="flex flex-wrap gap-3">
                                    {user.allergies.map((allergy, index) => (
                                        <Tag key={index} variant="secondary" size="sm">
                                            {allergy.allergy}
                                        </Tag>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-foreground/70 text-sm italic">
                                    No allergies recorded. Click "Edit" to specify any allergies or dietary restrictions.
                                </p>
                            )}
                        </Card>
                    </div>

                    {/* Actions Sidebar */}
                    <div className="space-y-6">
                        <Card className="rounded-xl p-6" size="sm" hoverEffect="none">
                            <h3 className="text-2xl font-bold text-foreground mb-6">⚡ Quick Actions</h3>
                            <div className="space-y-4">
                                <Button onClick={() => router.push('/events')} className="glass-action-btn glass-action-primary w-full px-5 py-4 text-left">📅 View My Events</Button>
                                <Button onClick={() => router.push('/events/create')} className="glass-action-btn glass-action-primary w-full px-5 py-4 text-left">➕ Create Event</Button>
                                <Button onClick={handleLogout} variant="accent" className="glass-action-btn glass-action-muted w-full px-5 py-4 text-left">🚪 Logout</Button>
                            </div>
                        </Card>

                        <Card className="rounded-xl p-6" size="sm" hoverEffect="none">
                            <h3 className="text-xl font-bold text-foreground mb-3">⚙️ Account Settings</h3>
                            <p className="text-foreground text-sm">
                                Need to update your information? Contact support for account modifications.
                            </p>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
