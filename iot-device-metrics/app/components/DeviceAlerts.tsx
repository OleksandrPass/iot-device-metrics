'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Alert } from '../types/device';

interface DeviceAlertsProps {
    deviceId: string;
    token: string;
}

const ALERTS_API_URL = 'https://vdds-iot.duckdns.org/api/alerts';

const DeviceAlerts: React.FC<DeviceAlertsProps> = ({ deviceId, token }) => {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchAlerts = useCallback(async () => {
        if (!deviceId || !token) return;

        try {
            const response = await fetch(`${ALERTS_API_URL}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });
            if (!response.ok) throw new Error('Failed to fetch alerts');
            const data = await response.json();
            setAlerts(data);
        } catch (err) {
            console.error("Alerts fetch error:", err);
        } finally {
            setLoading(false);
        }
    }, [deviceId, token]);

    useEffect(() => {
        setLoading(true);
        fetchAlerts();
        const interval = setInterval(fetchAlerts, 5000);
        return () => clearInterval(interval);
    }, [fetchAlerts]);

    if (loading && !alerts.length) return <div className="text-sm text-gray-500">Loading alerts...</div>;

    return (
        <div className="mt-10">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                Device Alerts
            </h2>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Rule Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Message</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Time</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {alerts.length > 0 ? (
                        alerts.slice(0,5).map((alert) => (
                            <tr key={alert.id} className={alert.isRead ? 'opacity-60' : 'bg-white'}>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                    {alert.alertRule.name}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700">
                                    {alert.message}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500 italic">
                                    {new Date(alert.triggeredAt).toLocaleString()}
                                </td>
                                <td className="px-4 py-3">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${
                                            alert.isRead ? 'bg-gray-200 text-gray-500' : 'bg-red-200 text-red-700'
                                        }`}>
                                            {alert.isRead ? 'Read' : 'New'}
                                        </span>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">
                                No alerts found for this device.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DeviceAlerts;