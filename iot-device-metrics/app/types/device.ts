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

