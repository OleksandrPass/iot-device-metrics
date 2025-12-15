'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Device, Metric } from '../types/device'; // Ensure correct path to types

const DEVICES_API_URL = 'http://localhost:3000/api/devices/user-devices';
const METRICS_BASE_API_URL = 'http://localhost:3000/api/measurements';

// Define the polling interval constant
const POLLING_INTERVAL_MS = 5000; // 5 seconds

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

    // Use a ref to track if the initial metric fetch is done
    const initialMetricsLoaded = useRef(false);

    // --- PHASE 1: Authentication Check (Runs on mount) ---
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
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
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
        // We only set loading/error states for the *initial* fetch.
        // During polling, we silently update data.
        if (!initialMetricsLoaded.current) {
            setMetrics(null);
            setLoading(true);
            setError(null);
        }

        try {
            const url = `${METRICS_BASE_API_URL}/${deviceId}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch metrics for device ${deviceId}.`);
            }

            const data: Metric[] = await response.json();
            setMetrics(data);

            // Only set loading to false and mark initial load after the first successful fetch
            if (!initialMetricsLoaded.current) {
                setLoading(false);
                initialMetricsLoaded.current = true;
            }

        } catch (err) {
            // Only show an error for the initial fetch or a critical failure
            if (!initialMetricsLoaded.current) {
                setError(`Metrics Error: ${(err as Error).message}`);
                setLoading(false);
            }
            // For polling errors, we log and skip the update
            console.error("Polling failed:", err);
        }
    }, []);

    // --- PHASE 4: Polling Effect (The new part) ---
    useEffect(() => {
        let intervalId: NodeJS.Timeout | null = null;

        // Ensure we have a device selected and an auth token
        if (selectedDeviceId && authToken) {
            // Reset the initial load flag when a NEW device is selected
            initialMetricsLoaded.current = false;

            // 1. Immediately fetch metrics for the first time
            fetchMetrics(selectedDeviceId, authToken);

            // 2. Set up the interval for continuous fetching
            intervalId = setInterval(() => {
                // Call fetchMetrics again every 5 seconds
                fetchMetrics(selectedDeviceId, authToken);
            }, POLLING_INTERVAL_MS);
        }

        // 3. CLEANUP: This function runs when the component unmounts OR
        // when selectedDeviceId or authToken changes (re-running the effect).
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
            initialMetricsLoaded.current = false; // Reset on cleanup
        };
    }, [selectedDeviceId, authToken, fetchMetrics]);


    const handleDeviceSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const deviceId = e.target.value;
        setSelectedDeviceId(deviceId);
    };

    // --- Render Logic (UI remains largely the same) ---
    return (
        <div className="p-8 space-y-8">
            <h1>IoT Device Dashboard</h1>

            {/* Loading & Error Messages */}
            {(loading && !devices.length) && <div className="p-4">Loading devices...</div>}
            {error && <div className="p-4 text-red-500 border border-red-500 bg-red-50 rounded">Error: {error}</div>}

            <p className="text-sm text-gray-500">Metrics are updated every {POLLING_INTERVAL_MS / 1000} seconds.</p>


            {/* Device Selection Dropdown */}
            <div className="flex items-center space-x-4">
                <label htmlFor="device-select" className="font-semibold">Select Device:</label>
                <select
                    id="device-select"
                    onChange={handleDeviceSelect}
                    value={selectedDeviceId || ''}
                    className="p-2 border border-gray-300 rounded"
                    disabled={loading}
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
                    <h2 className="text-xl font-bold mb-4">Metrics for Device: {selectedDeviceId}</h2>

                    {(loading && !initialMetricsLoaded.current) && <p>Fetching initial metrics...</p>}

                    {/* The UI should not show "Loading" while polling, only during initial fetch or selection change */}
                    {metrics && metrics.length > 0 ? (
                        <div className="space-y-3">
                            {/* Displaying the latest metric data */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Temperature</th>
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
                                    {metrics.slice(0, 3).map((metric, index) => ( // Show only top 3 for brevity
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(metric.timestamp).toLocaleTimeString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{metric.temperature.toFixed(1)}°C</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{metric.humidity.toFixed(1)}%</td>
                                            {/* Note: Assuming these properties exist on the Metric type */}
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
        </div>
    );
};

export default DevicesPage;