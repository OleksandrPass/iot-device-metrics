'use client';

import React, { useState } from 'react';
import { Device, Metric } from '../types/device';

interface DeviceMetricsProps {
    devices: Device[];
    selectedDeviceId: string | null;
    selectedDevice: Device | undefined;
    metrics: Metric[] | null;
    loading: boolean;
    handleDeviceSelect: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    handleDeleteDevice: (deviceId: string) => Promise<void>;
    onEditClick: (device: Device) => void;
    initialMetricsLoaded: React.MutableRefObject<boolean>;
    pollingInterval: number;
    showCreateForm: boolean;
}

const DeviceMetrics: React.FC<DeviceMetricsProps> = ({
                                                         devices,
                                                         selectedDeviceId,
                                                         selectedDevice,
                                                         metrics,
                                                         loading,
                                                         handleDeviceSelect,
                                                         handleDeleteDevice,
                                                         onEditClick,
                                                         initialMetricsLoaded,
                                                         pollingInterval,
                                                         showCreateForm,
                                                     }) => {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const onConfirmDelete = () => {
        if (selectedDeviceId) {
            handleDeleteDevice(selectedDeviceId);
        }
        setShowDeleteConfirm(false);
    };

    const getCategoryStyles = (category: string) => {
        const cat = category.toLowerCase();
        if (cat.includes('sensitive') || cat.includes('unhealthy')) {
            return 'bg-red-100 text-red-800 border border-red-200';
        }
        if (cat.includes('good') || cat.includes('healthy')) {
            return 'bg-green-100 text-green-800 border border-green-200';
        }
        if (cat.includes('moderate')) {
            return 'bg-orange-100 text-orange-800 border border-orange-200';
        }
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    };

    return (
        <div className="mt-10">
            {showDeleteConfirm && selectedDevice && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full">
                        <h3 className="text-xl font-bold text-red-700 mb-4">Confirm Deletion</h3>
                        <p className="mb-6 text-gray-700">Are you sure you want to permanently delete **{selectedDevice.name}**? This action cannot be undone.</p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100 transition"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onConfirmDelete}
                                className="px-4 py-2 border rounded-md text-white bg-red-600 hover:bg-red-700 transition disabled:opacity-50"
                                disabled={loading}
                            >
                                {loading ? 'Deleting...' : 'Permanently Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div className="flex flex-col gap-1">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        Device Metrics
                    </h2>
                    <p className="text-xs text-gray-500 italic">Auto-refreshing every {pollingInterval / 1000}s</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <select
                        id="deviceSelect"
                        value={selectedDeviceId || ''}
                        onChange={handleDeviceSelect}
                        className="p-2 border border-gray-300 rounded-md bg-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-100"
                        disabled={loading || !devices.length || showCreateForm}
                    >
                        <option value="" disabled>{loading && !devices.length ? 'Fetching devices...' : 'Select a device'}</option>
                        {devices.map((device) => (
                            <option key={device.id} value={device.id}>
                                {device.name} ({device.locationName || 'No Location'})
                            </option>
                        ))}
                    </select>

                    {selectedDevice && (
                        <>
                            <button
                                onClick={() => onEditClick(selectedDevice)}
                                className="px-4 py-2 bg-yellow-500 text-white text-sm font-semibold rounded-md shadow-sm hover:bg-yellow-600 transition disabled:opacity-50"
                                disabled={loading || showCreateForm}
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="px-4 py-2 border border-red-200 text-red-600 text-sm font-semibold rounded-md shadow-sm hover:bg-red-50 transition disabled:opacity-50"
                                disabled={loading || showCreateForm}
                            >
                                Delete
                            </button>
                        </>
                    )}
                </div>
            </div>

            {selectedDeviceId && (
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Time</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Temp</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Humidity</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">CO2</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">PM2.5</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">PM10</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">AQI</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Health Message</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                            {metrics && metrics.length > 0 ? (
                                metrics.slice(0, 5).map((metric, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                                            {new Date(metric.timestamp).toLocaleTimeString()}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                                            {metric.temperature.toFixed(1)}°C
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            {metric.humidity.toFixed(1)}%
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            {metric.co2.toFixed(0)} ppm
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            {metric.pm2_5.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            {metric.pm10.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900 font-mono">
                                            {metric.aqi.toFixed(1)}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full ${getCategoryStyles(metric.category)}`}>
                                                {metric.category}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 italic">
                                            {metric.healthMessage}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={9} className="px-4 py-10 text-center text-sm text-gray-500 italic">
                                        No recent metrics data available.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeviceMetrics;