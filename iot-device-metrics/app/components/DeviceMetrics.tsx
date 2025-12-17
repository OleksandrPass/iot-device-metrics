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

    return (
        <>
            {showDeleteConfirm && selectedDevice && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full">
                        <h3 className="text-xl font-bold text-red-700 mb-4">Confirm Deletion</h3>
                        <p className="mb-6">Are you sure you want to permanently delete **{selectedDevice.name}**? This action cannot be undone.</p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onConfirmDelete}
                                className="px-4 py-2 border rounded-md text-white bg-red-600 hover:bg-700 disabled:opacity-50"
                                disabled={loading}
                            >
                                {loading ? 'Deleting...' : 'Permanently Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <p className="text-sm text-gray-500">Metrics are updated every {pollingInterval / 1000} seconds.</p>

            <div className="flex items-center space-x-4">
                <label htmlFor="device-select" className="font-semibold">Select Device:</label>
                <select
                    id="device-select"
                    onChange={handleDeviceSelect}
                    value={selectedDeviceId || ''}
                    className="p-2 border border-gray-300 rounded"
                    disabled={loading || !devices.length || showCreateForm || showDeleteConfirm}
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



                {selectedDeviceId && (
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md shadow hover:bg-red-700 transition disabled:opacity-50"
                        disabled={loading || showCreateForm || showDeleteConfirm}
                    >
                        Delete Device
                    </button>
                )}
            </div>

            {selectedDeviceId && (
                <div className="mt-8 p-6 border rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4">Metrics for Device: {selectedDevice?.name || selectedDeviceId}</h2>

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

export default DeviceMetrics;