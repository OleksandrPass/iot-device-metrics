'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState, useCallback } from 'react';

const USER_PROFILE_API_URL = 'http://51.103.231.79:3000/api/users/patch';
const DELETE_USER_API_URL = 'http://51.103.231.79:3000/api/users';

interface UserProfile {
    id: string;
    email: string;
    username?: string;
}

const AccountPage: React.FC = () => {
    const router = useRouter();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [newEmail, setNewEmail] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateError, setUpdateError] = useState<string | null>(null);

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleLogout = useCallback(() => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
        router.push('/log-in');
    }, [router]);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const userId = localStorage.getItem('userId');
        const userEmail = localStorage.getItem('userEmail');

        if (!token || !userId || !userEmail) {
            router.push('/log-in');
            return;
        }

        const profile: UserProfile = {
            id: userId,
            email: userEmail,
            username: localStorage.getItem('username'),
        };
        setUserProfile(profile);
        setNewEmail(profile.email);
        setNewUsername(profile.username);
        setLoading(false);

    }, [router]);

    const handleUpdateProfile = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('authToken');
        if (!token || !userProfile) return;

        setIsUpdating(true);
        setUpdateError(null);

        const payload = {
            email: newEmail,
            username: newUsername,
        };

        const user = userProfile;

        if (!newEmail.trim() || !newUsername.trim()) {
            setUpdateError("Email and Username cannot be empty.");
            setIsUpdating(false);
            return;
        }

        try {
            const response = await fetch(USER_PROFILE_API_URL, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update profile.');
            }

            const updatedProfile: UserProfile = await response.json();

            localStorage.setItem('userEmail', updatedProfile.email);
            if (updatedProfile.username) localStorage.setItem('userName', updatedProfile.username);

            setUserProfile(updatedProfile);
            setNewEmail(updatedProfile.email);
            setNewUsername(updatedProfile.username || '');

            alert('Profile successfully updated!');

        } catch (err) {
            setUpdateError(`Update Error: ${(err as Error).message}`);
        } finally {
            setIsUpdating(false);
        }
    }, [userProfile, newEmail, newUsername]);

    const handleDeleteAccount = useCallback(async () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            handleLogout();
            return;
        }

        setIsDeleting(true);
        setError(null);

        const userdel = localStorage.getItem('userId');

        try {
            const response = await fetch(`${DELETE_USER_API_URL}/${userdel}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = response.status !== 204 ? await response.json() : {};
                throw new Error(errorData.message || 'Failed to delete account.');
            }

            handleLogout();
            alert('Your account has been permanently deleted.');

        } catch (err) {
            setError(`Deletion Error: ${(err as Error).message}`);
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    }, [handleLogout]);


    if (loading) {
        return <div className="p-8 text-lg">Loading user profile...</div>;
    }

    if (error) {
        return <div className="p-8 text-red-500">Error: {error}</div>;
    }

    if (!userProfile) {
        return <div className="p-8 text-gray-500">No profile data available.</div>;
    }

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8">

            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full">
                        <h3 className="text-xl font-bold text-red-700 mb-4">Confirm Account Deletion</h3>
                        <p className="mb-6">
                            **WARNING:** This action is permanent and will delete all associated data and devices. Are you absolutely sure?
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                className="px-4 py-2 border rounded-md text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400"
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Deleting...' : 'Delete My Account'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center pb-4 border-b">
                <h1 className="text-3xl font-bold">👤 My Account</h1>
                <button
                    onClick={() => router.push('/devices')}
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow hover:bg-blue-700 transition"
                >
                    &larr; Back to Dashboard
                </button>
            </div>

            <div className="bg-white p-6 border rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Change User Info (Email/Username)</h2>

                <form onSubmit={handleUpdateProfile} className="space-y-4">

                    <div>
                        <label className="block text-sm font-medium text-gray-700" htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                            required
                            disabled={isUpdating}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700" htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                            required
                            disabled={isUpdating}
                        />
                    </div>

                    {updateError && <p className="text-red-500 text-sm pt-2">{updateError}</p>}

                    <div className="pt-2">
                        <button
                            type="submit"
                            className="px-6 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition disabled:bg-green-400"
                            disabled={isUpdating}
                        >
                            {isUpdating ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="p-6 border border-red-300 bg-red-50 rounded-lg shadow-lg space-y-4">
                <h2 className="text-xl font-semibold text-red-700">Danger Zone</h2>
                <p className="text-sm text-red-600">
                    Permanently delete your user account and all associated device data.
                </p>
                <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-6 py-2 border border-red-700 text-red-700 font-semibold rounded-md hover:bg-red-100 transition"
                    disabled={isDeleting}
                >
                    Remove User Account
                </button>
            </div>

            <div className="pt-6">
                <button
                    onClick={handleLogout}
                    className="px-6 py-2 border border-gray-500 text-gray-700 font-semibold rounded-md shadow hover:bg-gray-100 transition"
                >
                    Log Out of Session
                </button>
            </div>
        </div>
    );
};

export default AccountPage;