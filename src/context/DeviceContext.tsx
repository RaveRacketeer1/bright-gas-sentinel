
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Device, GasReading } from '@/types';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface DeviceContextType {
  devices: Device[];
  loading: boolean;
  addDevice: (serialNumber: string, name: string) => Promise<void>;
  removeDevice: (deviceId: string) => Promise<void>;
  refreshDevices: () => Promise<void>;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

export const useDevices = () => {
  const context = useContext(DeviceContext);
  if (context === undefined) {
    throw new Error('useDevices must be used within a DeviceProvider');
  }
  return context;
};

export const DeviceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Fetch devices when user changes
  useEffect(() => {
    if (user) {
      refreshDevices();
    } else {
      setDevices([]);
      setLoading(false);
    }
  }, [user]);

  const refreshDevices = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // This would be replaced with actual Supabase query
      // Mock data for demo
      const storedDevices = localStorage.getItem(`proton_devices_${user.id}`);
      
      if (storedDevices) {
        const parsedDevices: Device[] = JSON.parse(storedDevices);
        
        // Simulate fetching latest readings from Supabase
        const devicesWithReadings = parsedDevices.map(device => {
          // Generate a "latest reading" for demo
          const level = Math.floor(Math.random() * 40) + 40; // Random level between 40-80%
          
          const reading: GasReading = {
            id: 'reading-' + Math.random().toString(36).substr(2, 9),
            deviceId: device.id,
            level,
            timestamp: new Date().toISOString()
          };
          
          return {
            ...device,
            lastReading: reading
          };
        });
        
        setDevices(devicesWithReadings);
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
      toast.error('Failed to load your devices');
    } finally {
      setLoading(false);
    }
  };

  const addDevice = async (serialNumber: string, name: string) => {
    if (!user) throw new Error('You must be logged in to add a device');
    
    try {
      // Check if device already exists
      if (devices.some(d => d.serialNumber === serialNumber)) {
        throw new Error('Device with this serial number already exists');
      }
      
      // This would be a call to Supabase to register the device
      // For now, just create a mock device
      const newDevice: Device = {
        id: 'device-' + Math.random().toString(36).substr(2, 9),
        serialNumber,
        name: name || `Tank ${serialNumber.slice(-4)}`,
        userId: user.id,
        lastReading: {
          id: 'reading-' + Math.random().toString(36).substr(2, 9),
          deviceId: '',
          level: Math.floor(Math.random() * 40) + 40, // Random level between 40-80%
          timestamp: new Date().toISOString()
        }
      };
      
      newDevice.lastReading.deviceId = newDevice.id;
      
      const updatedDevices = [...devices, newDevice];
      setDevices(updatedDevices);
      
      // Store in localStorage for demo
      localStorage.setItem(`proton_devices_${user.id}`, JSON.stringify(updatedDevices));
      
    } catch (error) {
      console.error('Error adding device:', error);
      throw error;
    }
  };

  const removeDevice = async (deviceId: string) => {
    if (!user) throw new Error('You must be logged in to remove a device');
    
    try {
      const updatedDevices = devices.filter(d => d.id !== deviceId);
      setDevices(updatedDevices);
      
      // Update localStorage for demo
      localStorage.setItem(`proton_devices_${user.id}`, JSON.stringify(updatedDevices));
      
      toast.success('Device removed successfully');
    } catch (error) {
      console.error('Error removing device:', error);
      toast.error('Failed to remove device');
      throw error;
    }
  };

  return (
    <DeviceContext.Provider
      value={{
        devices,
        loading,
        addDevice,
        removeDevice,
        refreshDevices
      }}
    >
      {children}
    </DeviceContext.Provider>
  );
};
