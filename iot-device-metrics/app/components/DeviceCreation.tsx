'use client';

import React, { useState } from 'react';
import { Device } from '../types/device';

// API Endpoint (Remains the same for POST)
const CREATE_DEVICE_API_URL = 'http://51.103.231.79:3000/api/devices';

interface DeviceCreateFormProps {
    token: string;
    onClose: () => void;
    onDeviceCreated: (newDevice: Device) => void;
}

const DeviceCreateForm: React.FC<DeviceCreateFormProps> = ({ token, onClose, onDeviceCreated }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [locationName, setLocationName] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormError(null);

        if (!name.trim() || !description.trim() || !locationName.trim()) {
            setFormError("Device name, description, and location are required.");
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await fetch(CREATE_DEVICE_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                // Updated payload to include description and locationName
                body: JSON.stringify({ name, description, locationName }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create device.');
            }

            const newDevice: Device = await response.json();
            onDeviceCreated(newDevice);
            onClose();

        } catch (err) {
            setFormError(`Creation Error: ${(err as Error).message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6 border border-blue-400 bg-blue-50 rounded-lg shadow-xl mb-8">
            <h3 className="text-lg font-bold mb-4 text-blue-800">Register New Device</h3>
            <form onSubmit={handleSubmit} className="space-y-4">

                {/* 1. Device Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700" htmlFor="deviceName">Device Name</label>
                    <input
                        id="deviceName"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                        required
                    />
                </div>

                {/* 2. Device Description (New Field) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700" htmlFor="deviceDescription">Device Description</label>
                    <textarea
                        id="deviceDescription"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                        required
                    />
                </div>

                {/* 3. Location Name (New Field) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700" htmlFor="locationName">Location Name</label>
                    <input
                        id="locationName"
                        type="text"
                        value={locationName}
                        onChange={(e) => setLocationName(e.target.value)}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                        required
                    />
                </div>

                {formError && <p className="text-red-500 text-sm">{formError}</p>}

                <div className="flex justify-end space-x-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 border rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Creating...' : 'Create Device'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default DeviceCreateForm;