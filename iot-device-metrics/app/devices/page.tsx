'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Device, Metric } from '../types/device';
import DeviceCreateForm from '../components/DeviceCreation'; // Import the new creation form
import DeviceMetrics from '../components/DeviceMetrics';     // Import the new metrics component

const DEVICES_API_URL = 'http://localhost:3000/api/devices/user-devices';
const METRICS_BASE_API_URL = 'http://localhost:3000/api/measurements';

const POLLING_INTERVAL_MS = 5000;

const DevicesPage: React.FC = () => {
    const router = useRouter();

    const [authToken, setAuthToken] = useState<string | null>(null);
    const [devices, setDevices] = useState<Device[]>([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
    const [metrics, setMetrics] = useState<Metric[] | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);

    const initialMetricsLoaded = useRef(false);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            router.push('/log-in');
        } else {
            setAuthToken(token);
            setLoading(false);
        }
    }, [router]);

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


    const handleDeviceSelect = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const deviceId = e.target.value;
        setSelectedDeviceId(deviceId);
    }, []);

    const handleNewDeviceCreated = useCallback((newDevice: Device) => {
        setDevices(prev => [...prev, newDevice]);
        setSelectedDeviceId(newDevice.id);
        setError(null);
    }, []);

    const handleLogout = useCallback(() => {
        // 1. Clear stored token and user info
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');

        // 2. Clear state in the current component
        setAuthToken(null);
        setDevices([]);
        setSelectedDeviceId(null);
        setMetrics(null);

        // 3. Redirect to the login page
        router.push('/log-in');
    }, [router]);

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center mb-6">
                <h1>IoT Device Dashboard</h1>
                <button
                    onClick={() => setShowCreateForm(true)}
                    className="px-6 py-2 bg-green-600 text-white font-semibold rounded-md shadow hover:bg-green-700 transition"
                    disabled={!authToken || loading || showCreateForm}
                >
                    + Create New Device
                </button>
            </div>

            {showCreateForm && authToken && (
                <DeviceCreateForm
                    token={authToken}
                    onClose={() => setShowCreateForm(false)}
                    onDeviceCreated={handleNewDeviceCreated}
                />
            )}

            {(loading && !devices.length && !showCreateForm) && <div className="p-4">Loading devices...</div>}
            {error && <div className="p-4 text-red-500 border border-red-500 bg-red-50 rounded">Error: {error}</div>}

            <DeviceMetrics
                devices={devices}
                selectedDeviceId={selectedDeviceId}
                metrics={metrics}
                loading={loading}
                handleDeviceSelect={handleDeviceSelect}
                initialMetricsLoaded={initialMetricsLoaded}
                pollingInterval={POLLING_INTERVAL_MS}
            />
            <div>
                <button
                    onClick={handleLogout}
                    className="px-6 py-2 border border-red-500 text-red-600 font-semibold rounded-md shadow hover:bg-red-50 transition"
                    disabled={!authToken}
                >
                    Log Out
                </button>
            </div>

        </div>

    );
};

export default DevicesPage;