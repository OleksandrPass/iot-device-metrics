'use client';

import React, { useState } from 'react';
import { Device } from '../types/device';

interface DevicePatchFormProps {
    device: Device;
    token: string;
    onClose: () => void;
    onDevicePatched: (
        deviceId: string,
        updatedFields: { name?: string; description?: string; locationName?: string }
    ) => Promise<boolean>;
}

const DevicePatchForm: React.FC<DevicePatchFormProps> = ({ device, onClose, onDevicePatched }) => {
    const [name, setName] = useState(device.name);
    const [description, setDescription] = useState(device.description || '');
    const [locationName, setLocationName] = useState(device.locationName || '');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormError(null);

        if (!name.trim() || !description.trim() || !locationName.trim()) {
            setFormError("All fields are required.");
            setIsSubmitting(false);
            return;
        }

        const updatedFields = { name, description, locationName };

        const patchPayload: { [key: string]: string } = {};
        if (name !== device.name) patchPayload.name = name;
        if (description !== device.description) patchPayload.description = description;
        if (locationName !== device.locationName) patchPayload.locationName = locationName;

        if (Object.keys(patchPayload).length === 0) {
            setFormError("No changes detected.");
            setIsSubmitting(false);
            return;
        }


        try {
            const success = await onDevicePatched(device.id, patchPayload);

            if (success) {
                onClose();
            } else {
                setFormError("Failed to apply changes. Check console for details.");
            }

        } catch (err) {
            setFormError(`Update Error: ${(err as Error).message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-2xl max-w-lg w-full">
                <h3 className="text-xl font-bold mb-4 text-blue-800">Edit Device: {device.name}</h3>

                <form onSubmit={handleSubmit} className="space-y-4">

                    <div>
                        <label className="block text-sm font-medium text-gray-700" htmlFor="patchName">Device Name</label>
                        <input
                            id="patchName"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700" htmlFor="patchDescription">Device Description</label>
                        <textarea
                            id="patchDescription"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700" htmlFor="patchLocation">Location Name</label>
                        <input
                            id="patchLocation"
                            type="text"
                            value={locationName}
                            onChange={(e) => setLocationName(e.target.value)}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                            required
                            disabled={isSubmitting}
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
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DevicePatchForm;