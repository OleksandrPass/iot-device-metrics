// app/devices/page.tsx

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
// NOTE: Ensure your types/device.ts file is correctly defined in the parent directory
import { Device, Metric } from '../types/device';

// --- Constants & API Endpoints ---
const POLLING_INTERVAL_MS = 5000;
const DEVICES_API_URL = 'http://51.103.231.79:3000/api/devices/user-devices';
const METRICS_BASE_API_URL = 'http://51.103.231.79:3000/api/measurements';
const CREATE_DEVICE_API_URL = 'http://51.103.231.79:3000/api/devices';


// ====================================================================
// 1. Device Creation Form Component
// ====================================================================

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

                {/* Device Name */}
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

                {/* Device Description */}
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

                {/* Location Name */}
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


// ====================================================================
// 2. Device Metrics Display Component
// ====================================================================

interface DeviceMetricsProps {
    devices: Device[];
    selectedDeviceId: string | null;
    selectedDevice: Device | undefined;
    metrics: Metric[] | null;
    loading: boolean;
    handleDeviceSelect: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    initialMetricsLoaded: React.MutableRefObject<boolean>;
    pollingInterval: number;
    showCreateForm: boolean; // Pass showCreateForm to disable controls
}

const DeviceMetrics: React.FC<DeviceMetricsProps> = ({
                                                         devices,
                                                         selectedDeviceId,
                                                         selectedDevice,
                                                         metrics,
                                                         loading,
                                                         handleDeviceSelect,
                                                         initialMetricsLoaded,
                                                         pollingInterval,
                                                         showCreateForm,
                                                     }) => {
    return (
        <>
            <p className="text-sm text-gray-500">Metrics are updated every {pollingInterval / 1000} seconds.</p>

            {/* Device Selection Dropdown */}
            <div className="flex items-center space-x-4">
                <label htmlFor="device-select" className="font-semibold">Select Device:</label>
                <select
                    id="device-select"
                    onChange={handleDeviceSelect}
                    value={selectedDeviceId || ''}
                    className="p-2 border border-gray-300 rounded"
                    disabled={loading || !devices.length || showCreateForm}
                >
                    <option value="" disabled>
                        {loading && !devices.length ? 'Fetching devices...' : 'Choose a Device'}
                    </option>
                    {devices.map(device => (
                        <option key={device.id} value={device.id}>
                            {device.name} ({device.isActive ? 'Active' : 'Inactive'})
                        </option>
                    ))}
                </select>
            </div>

            {/* Metrics Display Panel */}
            {selectedDeviceId && (
                <div className="mt-8 p-6 border rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4">Metrics for Device: {selectedDevice?.name || selectedDeviceId}</h2>

                    {/* Display Description and Location */}
                    {selectedDevice && (
                        <div className="mb-4 p-3 bg-white border rounded-md text-sm space-y-1">
                            <p><strong>Location:</strong> {selectedDevice.locationName || 'N/A'}</p>
                            <p><strong>Description:</strong> {selectedDevice.description || 'No description provided.'}</p>
                        </div>
                    )}

                    {(loading && !initialMetricsLoaded.current) && <p>Fetching initial metrics...</p>}

                    {metrics && metrics.length > 0 ? (
                        <div className="space-y-3">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Temp</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Humidity</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CO2 (ppm)</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PM2.5</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PM10</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AQI</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Health Message</th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {metrics.slice(0, 3).map((metric, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(metric.timestamp).toLocaleTimeString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{metric.temperature.toFixed(1)}°C</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{metric.humidity.toFixed(1)}%</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{metric.co2.toFixed(2)}ppm</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{metric.pm2_5.toFixed(2)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{metric.pm10.toFixed(2)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{metric.aqi.toFixed(2)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{metric.category}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{metric.healthMessage}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : metrics !== null && !loading && <p className="text-gray-600">No recent metrics data available for this device.</p>}
                </div>
            )}
        </>
    );
};


// ====================================================================
// 3. Main Devices Page (Container)
// ====================================================================

const DevicesPage: React.FC = () => {
    const router = useRouter();

    // State for data and authentication
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [devices, setDevices] = useState<Device[]>([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
    const [metrics, setMetrics] = useState<Metric[] | null>(null);

    // State for UI feedback
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);

    const initialMetricsLoaded = useRef(false);

    // --- Derived State ---
    const selectedDevice = devices.find(d => d.id === selectedDeviceId);

    // --- Logout Function ---
    const handleLogout = useCallback(() => {
        localStorage.removeItem('authToken');
        // Clear other user info if stored
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');

        setAuthToken(null);
        setDevices([]);
        setSelectedDeviceId(null);
        setMetrics(null);

        router.push('/log-in');
    }, [router]);


    // --- PHASE 1: Authentication Check ---
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            router.push('/log-in');
        } else {
            setAuthToken(token);
            setLoading(false);
        }
    }, [router]);

    // --- PHASE 2: Get All Devices ---
    const fetchDevices = useCallback(async (token: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(DEVICES_API_URL, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            });

            if (response.status === 401) {
                localStorage.removeItem('authToken');
                router.push('/log-in');
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to fetch device list. API returned non-200 status.');
            }

            const data: Device[] = await response.json();
            setDevices(data);
            setLoading(false);

        } catch (err) {
            setError(`Device List Error: ${(err as Error).message}`);
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        if (authToken) {
            fetchDevices(authToken);
        }
    }, [authToken, fetchDevices]);

    // --- PHASE 3: Get Metrics Logic (Optimized for Polling) ---
    const fetchMetrics = useCallback(async (deviceId: string, token: string) => {
        if (!initialMetricsLoaded.current) {
            setMetrics(null);
            setLoading(true);
            setError(null);
        }

        try {
            const url = `${METRICS_BASE_API_URL}/${deviceId}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch metrics for device ${deviceId}.`);
            }

            const data: Metric[] = await response.json();
            setMetrics(data);

            if (!initialMetricsLoaded.current) {
                setLoading(false);
                initialMetricsLoaded.current = true;
            }

        } catch (err) {
            if (!initialMetricsLoaded.current) {
                setError(`Metrics Error: ${(err as Error).message}`);
                setLoading(false);
            }
            console.error("Polling failed:", err);
        }
    }, []);

    // --- PHASE 4: Polling Effect (5-second interval) ---
    useEffect(() => {
        let intervalId: NodeJS.Timeout | null = null;

        if (selectedDeviceId && authToken) {
            initialMetricsLoaded.current = false;
            fetchMetrics(selectedDeviceId, authToken);

            intervalId = setInterval(() => {
                fetchMetrics(selectedDeviceId, authToken);
            }, POLLING_INTERVAL_MS);
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
            initialMetricsLoaded.current = false;
        };
    }, [selectedDeviceId, authToken, fetchMetrics]);


    // --- HANDLERS ---
    const handleDeviceSelect = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const deviceId = e.target.value;
        setSelectedDeviceId(deviceId);
    }, []);

    const handleNewDeviceCreated = useCallback((newDevice: Device) => {
        setDevices(prev => [...prev, newDevice]);
        setSelectedDeviceId(newDevice.id);
        setError(null);
    }, []);

    // --- Render Logic ---
    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">IoT Device Dashboard</h1>

                <div className="flex space-x-4">
                    {/* Create Device Button */}
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="px-6 py-2 bg-green-600 text-white font-semibold rounded-md shadow hover:bg-green-700 transition"
                        disabled={!authToken || loading || showCreateForm}
                    >
                        + Create New Device
                    </button>

                    {/* Log Out Button */}
                    <button
                        onClick={handleLogout}
                        className="px-6 py-2 border border-red-500 text-red-600 font-semibold rounded-md shadow hover:bg-red-50 transition"
                        disabled={!authToken}
                    >
                        Log Out
                    </button>
                </div>
            </div>

            {/* Conditional Device Creation Form */}
            {showCreateForm && authToken && (
                <DeviceCreateForm
                    token={authToken}
                    onClose={() => setShowCreateForm(false)}
                    onDeviceCreated={handleNewDeviceCreated}
                />
            )}

            {/* Loading & Error Messages */}
            {(loading && !devices.length && !showCreateForm) && <div className="p-4">Loading devices...</div>}
            {error && <div className="p-4 text-red-500 border border-red-500 bg-red-50 rounded">Error: {error}</div>}

            {/* Metrics Component */}
            <DeviceMetrics
                devices={devices}
                selectedDeviceId={selectedDeviceId}
                selectedDevice={selectedDevice}
                metrics={metrics}
                loading={loading}
                handleDeviceSelect={handleDeviceSelect}
                initialMetricsLoaded={initialMetricsLoaded}
                pollingInterval={POLLING_INTERVAL_MS}
                showCreateForm={showCreateForm}
            />
        </div>
    );
};

export default DevicesPage;