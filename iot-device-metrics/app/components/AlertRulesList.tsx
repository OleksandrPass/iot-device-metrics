'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AlertRule } from '../types/device';

interface AlertRulesListProps {
    deviceId: string;
    token: string;
}

const AlertRulesList: React.FC<AlertRulesListProps> = ({ deviceId, token }) => {
    const [rules, setRules] = useState<AlertRule[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchRules = useCallback(async () => {
        try {
            const response = await fetch(`http://51.103.231.79:3000/api/alert-rules`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch rules');
            const data = await response.json();
            setRules(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [deviceId, token]);

    const handleDeleteRule = async (ruleId: string) => {
        if (!confirm("Are you sure you want to delete this alert rule?")) return;

        setDeletingId(ruleId);
        try {
            const response = await fetch(`http://51.103.231.79:3000/api/alert-rules/${ruleId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to delete rule');

            // Remove from local state
            setRules(prev => prev.filter(r => r.id !== ruleId));
        } catch (err) {
            alert("Error deleting rule: " + (err as Error).message);
        } finally {
            setDeletingId(null);
        }
    };

    useEffect(() => {
        fetchRules();
    }, [fetchRules]);

    if (loading) return <p className="text-sm text-gray-500">Loading active rules...</p>;

    return (
        <div className="w-full">
            <h3 className="text-md font-bold text-gray-700 mb-3 flex items-center gap-2">
                Active Threshold Rules
            </h3>
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Rule Name</th>
                        <th className="px-2 py-2 text-center text-xs font-semibold text-gray-600 uppercase text-[10px]">PM2.5</th>
                        <th className="px-2 py-2 text-center text-xs font-semibold text-gray-600 uppercase text-[10px]">PM10</th>
                        <th className="px-2 py-2 text-center text-xs font-semibold text-gray-600 uppercase text-[10px]">CO2</th>
                        <th className="px-2 py-2 text-center text-xs font-semibold text-gray-600 uppercase text-[10px]">AQI</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white text-sm">
                    {rules.length > 0 ? (
                        rules.map((rule) => (
                            <tr key={rule.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 font-medium text-gray-900">{rule.name}</td>
                                <td className="px-2 py-3 text-center text-gray-600 font-mono">{rule.pm2_5Threshold}</td>
                                <td className="px-2 py-3 text-center text-gray-600 font-mono">{rule.pm10Threshold}</td>
                                <td className="px-2 py-3 text-center text-gray-600 font-mono">{rule.co2Threshold}</td>
                                <td className="px-2 py-3 text-center text-gray-600 font-mono">{rule.aqiThreshold}</td>
                                <td className="px-4 py-3 text-center">
                                    <button
                                        onClick={() => handleDeleteRule(rule.id)}
                                        disabled={deletingId === rule.id}
                                        className="text-red-500 hover:text-red-700 font-bold p-1 rounded hover:bg-red-50 disabled:opacity-50 transition"
                                        title="Delete Rule"
                                    >
                                        {deletingId === rule.id ? '...' : '🗑️'}
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={6} className="px-4 py-6 text-center text-gray-500 italic">No rules defined for this device.</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AlertRulesList;