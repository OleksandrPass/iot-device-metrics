'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Device, Metric } from '../types/device';
import DeviceCreateForm from '../components/DeviceCreation';
import DeviceMetrics from '../components/DeviceMetrics';
import DevicePatchForm from '../components/DevicePatchForm';
import DeviceAlerts from "@/app/components/DeviceAlerts";
import AlertRuleForm from "@/app/components/DeviceAlertsForm";
import AlertRulesList from "@/app/components/AlertRulesList";

const POLLING_INTERVAL_MS = 5000;
const DEVICES_API_URL = 'https://vdds-iot.duckdns.org/api/devices/user-devices';
const METRICS_BASE_API_URL = 'https://vdds-iot.duckdns.org/api/measurements';
const DEVICE_BASE_API_URL = 'https://vdds-iot.duckdns.org/api/devices';
const DEVICE_PATCH_API_URL = 'https://vdds-iot.duckdns.org/api/devices/patch';

const DevicesPage: React.FC = () => {
    const router = useRouter();

    const [authToken, setAuthToken] = useState<string | null>(null);
    const [devices, setDevices] = useState<Device[]>([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
    const [metrics, setMetrics] = useState<Metric[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingDevice, setEditingDevice] = useState<Device | null>(null);
    const [showAlertForm, setShowAlertForm] = useState(false);

    const initialMetricsLoaded = useRef(false);
    const selectedDevice = devices.find(d => d.id === selectedDeviceId);

    const handleLogout = useCallback(() => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
        setAuthToken(null);
        setDevices([]);
        setSelectedDeviceId(null);
        setMetrics(null);
        router.push('/log-in');
    }, [router]);

    const handleDeviceSelect = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedDeviceId(e.target.value);
    }, []);

    const handleNewDeviceCreated = useCallback((newDevice: Device) => {
        setDevices(prev => [...prev, newDevice]);
        setSelectedDeviceId(newDevice.id);
        setError(null);
    }, []);

    const handleDeleteDevice = useCallback(async (deviceId: string) => {
        if (!authToken) return;
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${DEVICE_BASE_API_URL}/${deviceId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
            });

            if (!response.ok) throw new Error(`Failed to delete device ${deviceId}.`);

            setDevices(prevDevices => {
                const updatedDevices = prevDevices.filter(d => d.id !== deviceId);
                if (selectedDeviceId === deviceId) {
                    setSelectedDeviceId(updatedDevices.length > 0 ? updatedDevices[0].id : null);
                }
                return updatedDevices;
            });
        } catch (err) {
            setError(`Deletion Error: ${(err as Error).message}`);
        } finally {
            setLoading(false);
        }
    }, [authToken, selectedDeviceId]);

    const handleDevicePatched = useCallback(async (
        deviceId: string,
        updatedFields: { name?: string; description?: string; locationName?: string }
    ) => {
        if (!authToken) return false;
        try {
            const response = await fetch(`${DEVICE_PATCH_API_URL}/${deviceId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedFields)
            });

            if (!response.ok) throw new Error("Failed to update device");

            const updatedDeviceFromServer: Device = await response.json();

            setDevices(prev => prev.map(d => d.id === deviceId ? updatedDeviceFromServer : d));
            return true;
        } catch (err) {
            console.error("Update failed:", err);
            return false;
        }
    }, [authToken]);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            setAuthToken(null);
            setDevices([]);
            setSelectedDeviceId(null);
            router.push('/log-in');
        } else if (token !== authToken){
            setDevices([]);
            setSelectedDeviceId(null);
            setAuthToken(token);
            setLoading(true);
        }
    }, [router, authToken]);

    const fetchDevices = useCallback(async (token: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(DEVICES_API_URL, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            });

            if (response.status === 401) {
                handleLogout();
                return;
            }

            if (!response.ok) throw new Error('Failed to fetch device list.');

            const data: Device[] = await response.json();
            setDevices(data);

            if (data.length > 0 && !selectedDeviceId) setSelectedDeviceId(data[0].id);
        } catch (err) {
            setError(`Device List Error: ${(err as Error).message}`);
        } finally {
            setLoading(false);
        }
    }, [handleLogout]);

    useEffect(() => {
        if (authToken) fetchDevices(authToken);
    }, [authToken, fetchDevices]);

    const fetchMetrics = useCallback(async (deviceId: string, token: string) => {
        if (!initialMetricsLoaded.current) {
            setMetrics(null);
            setLoading(true);
        }
        try {
            const response = await fetch(`${METRICS_BASE_API_URL}/${deviceId}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            });
            if (!response.ok) throw new Error(`Failed to fetch metrics.`);
            const data: Metric[] = await response.json();
            setMetrics(data);
            if (!initialMetricsLoaded.current) {
                setLoading(false);
                initialMetricsLoaded.current = true;
            }
        } catch (err) {
            console.error("Metrics Polling failed:", err);
        }
    }, []);


    useEffect(() => {
        let intervalId: NodeJS.Timeout | null = null;
        if (selectedDeviceId && authToken) {
            initialMetricsLoaded.current = false;
            fetchMetrics(selectedDeviceId, authToken);
            intervalId = setInterval(() => fetchMetrics(selectedDeviceId, authToken), POLLING_INTERVAL_MS);
        }
        return () => {
            if (intervalId) clearInterval(intervalId);
            initialMetricsLoaded.current = false;
        };
    }, [selectedDeviceId, authToken, fetchMetrics]);

    return (
        <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-extrabold text-gray-900">IoT Device Dashboard</h1>
                <div className="flex space-x-4">
                    <button
                        onClick={() => router.push('/account')}
                        className="px-6 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-md shadow-sm hover:bg-gray-50 transition"
                        disabled={!authToken || loading}
                    >
                        My Account
                    </button>
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 transition"
                        disabled={!authToken || loading}
                    >
                        + Create Device
                    </button>

                    <button
                        onClick={() => setShowAlertForm(true)}
                        className="px-6 py-2 bg-orange-500 text-white font-semibold rounded-md shadow-sm hover:bg-orange-600 transition"
                        disabled={!selectedDeviceId || loading}
                    >
                        Add Alert Rule
                    </button>


                    <button
                        onClick={handleLogout}
                        className="px-6 py-2 border border-red-200 text-red-600 font-semibold rounded-md shadow-sm hover:bg-red-50 transition"
                        disabled={!authToken}
                    >
                        Log Out
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 text-red-700 border border-red-200 bg-red-50 rounded-lg">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {loading && !devices.length && <div className="text-center py-10 text-gray-500">Initializing...</div>}
            <div className="flex justify-center space-x-4 mb-4">

                {showCreateForm && authToken && (
                    <DeviceCreateForm
                        token={authToken}
                        onClose={() => setShowCreateForm(false)}
                        onDeviceCreated={handleNewDeviceCreated}
                    />
                )}

                {editingDevice && authToken && (
                    <DevicePatchForm
                        device={editingDevice}
                        token={authToken}
                        onClose={() => setEditingDevice(null)}
                        onDevicePatched={handleDevicePatched}
                    />
                )}

                {showAlertForm && selectedDeviceId && authToken && (
                    <div className=" mx-auto space-y-8 mb-5">

                        <div>
                            <AlertRuleForm
                                deviceId={selectedDeviceId}
                                token={authToken}
                                onClose={() => setShowAlertForm(false)}
                            />
                        </div>


                    </div>
                )}
                {showAlertForm && selectedDeviceId && authToken && (
                <div className=" border-gray-200 pt-6">
                    <AlertRulesList
                        deviceId={selectedDeviceId}
                        token={authToken}
                    />
                </div>
                )}
            </div>

            <DeviceMetrics
                devices={devices}
                selectedDeviceId={selectedDeviceId}
                selectedDevice={selectedDevice}
                metrics={metrics}
                loading={loading}
                handleDeviceSelect={handleDeviceSelect}
                handleDeleteDevice={handleDeleteDevice}
                onEditClick={(device: Device) => setEditingDevice(device)}
                initialMetricsLoaded={initialMetricsLoaded}
                pollingInterval={POLLING_INTERVAL_MS}
                showCreateForm={showCreateForm}
            />

            {selectedDeviceId && authToken && (
                <div className="mt-8">
                    <DeviceAlerts
                        deviceId={selectedDeviceId}
                        token={authToken}
                    />
                </div>
            )}



        </div>
    );
};

export default DevicesPage;