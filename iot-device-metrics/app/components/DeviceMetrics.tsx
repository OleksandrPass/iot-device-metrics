// components/DeviceMetrics.tsx

'use client';

import React from 'react';
import { Device, Metric } from '../types/device'; // Adjust path as needed

interface DeviceMetricsProps {
    devices: Device[];
    selectedDeviceId: string | null;
    metrics: Metric[] | null;
    loading: boolean;
    handleDeviceSelect: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    initialMetricsLoaded: React.MutableRefObject<boolean>;
    pollingInterval: number;
}

const DeviceMetrics: React.FC<DeviceMetricsProps> = ({
                                                         devices,
                                                         selectedDeviceId,
                                                         metrics,
                                                         loading,
                                                         handleDeviceSelect,
                                                         initialMetricsLoaded,
                                                         pollingInterval,
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
                    disabled={loading || !devices.length}
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