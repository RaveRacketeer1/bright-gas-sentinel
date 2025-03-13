
export interface User {
  id: string;
  email: string;
}

export interface Device {
  id: string;
  serialNumber: string;
  userId: string;
  name: string;
  lastReading?: GasReading;
  readings?: GasReading[];
}

export interface GasReading {
  id: string;
  deviceId: string;
  level: number;
  timestamp: string;
}
