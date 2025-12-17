export type Device = {
    id: string;
    name: string;
    description: string;
    locationName: string;
    isActive: boolean;
};

export type Metric = {
    deviceId: string;
    timestamp: string;
    pm2_5: number;
    pm10: number;
    co2: number;
    aqi: number;
    temperature: number;
    humidity: number;
    category: string;
    healthMessage: string;
};

export interface Alert {
    id: string;
    deviceId: string;
    alertRuleId: string;
    message: string;
    isRead: boolean;
    triggeredAt: string;
    alertRule: {
        id: string;
        name: string;
        isActive: boolean;
    };
}

export interface AlertRule {
    id: string;
    userId: string;
    deviceId: string;
    name: string;
    pm2_5Threshold: number;
    pm10Threshold: number;
    co2Threshold: number;
    aqiThreshold: number;
    isActive: boolean;
}