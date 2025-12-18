'use client';

import React, { useState } from 'react';

interface AlertRuleFormProps {
    deviceId: string;
    token: string;
    onClose: () => void;
}

const AlertRuleForm: React.FC<AlertRuleFormProps> = ({ deviceId, token, onClose }) => {
    const [name, setName] = useState('');
    const [pm25, setPm25] = useState(67);
    const [pm10, setPm10] = useState(67);
    const [co2, setCo2] = useState(890);
    const [aqi, setAqi] = useState(500);
    const [isActive, setIsActive] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const storedUserId = localStorage.getItem('userId');

        const payload = {
            userId: storedUserId,
            deviceId: deviceId,
            name: name,
            pm2_5Threshold: pm25,
            pm10Threshold: pm10,
            co2Threshold: co2,
            aqiThreshold: aqi,
            isActive: isActive
        };

        try {
            const response = await fetch('https://vdds-iot.duckdns.org/api/alert-rules', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                alert('Alert rule created successfully!');
                onClose();
            } else {
                const errorData = await response.json();
                console.error('Server Error Details:', errorData);
                alert(`Failed: ${errorData.message || 'Check console for details'}`);
            }
        } catch (err) {
            console.error("Network Error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6 border border-gray-400 bg-gray-50 rounded-lg shadow-xl w-full space-y-4">
            <h3 className="text-lg font-bold mb-4 text-gray-800">Set Alert Thresholds</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Rule Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border rounded" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">PM2.5 Threshold</label>
                    <input type="number" value={pm25} onChange={(e) => setPm25(Number(e.target.value))} className="w-full p-2 border rounded" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">PM10 Threshold</label>
                    <input type="number" value={pm10} onChange={(e) => setPm10(Number(e.target.value))} className="w-full p-2 border rounded" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">CO2 Threshold (ppm)</label>
                    <input type="number" value={co2} onChange={(e) => setCo2(Number(e.target.value))} className="w-full p-2 border rounded" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">AQI Threshold</label>
                    <input type="number" value={aqi} onChange={(e) => setAqi(Number(e.target.value))} className="w-full p-2 border rounded" />
                </div>
                <div className="col-span-2 flex items-center gap-2">
                    <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} id="isActive" />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Rule is Active</label>
                </div>
                <div className="col-span-2 flex justify-end gap-3 mt-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 border rounded text-gray-700">Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600">
                        {isSubmitting ? 'Saving...' : 'Add Alert Rule'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AlertRuleForm;