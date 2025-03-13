
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Device, GasReading } from '@/types';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
      
      // Fetch devices from Supabase
      const { data: deviceData, error: deviceError } = await supabase
        .from('Proton_Gas')
        .select('*')
        .eq('user_id', user.id);
      
      if (deviceError) {
        throw deviceError;
      }
      
      if (deviceData) {
        // For each device, fetch the latest gas reading
        const devicesWithReadings = await Promise.all(deviceData.map(async (device) => {
          // Fetch the latest gas reading for this device
          const { data: gasReadings, error: readingError } = await supabase
            .from('gas_history')
            .select('*')
            .eq('device_id', device.id)
            .order('timestamp', { ascending: false })
            .limit(1);
          
          if (readingError) {
            console.error(`Error fetching readings for device ${device.id}:`, readingError);
          }
          
          const lastReading = gasReadings && gasReadings.length > 0 ? {
            id: gasReadings[0].id,
            deviceId: gasReadings[0].device_id,
            level: gasReadings[0].gas_level,
            timestamp: gasReadings[0].timestamp
          } : undefined;
          
          // Map the database device to our Device type
          const mappedDevice: Device = {
            id: device.id,
            serialNumber: device.serial_number,
            userId: device.user_id,
            name: device.device_name || `Tank ${device.serial_number.slice(-4)}`, // Use device_name if available
            lastReading
          };
          
          return mappedDevice;
        }));
        
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
      // Check if device already exists in the user's devices
      if (devices.some(d => d.serialNumber === serialNumber)) {
        throw new Error('Device with this serial number already exists in your account');
      }
      
      // First, check if the serial number exists in the Proton_Gas table
      const { data: existingDevice, error: deviceCheckError } = await supabase
        .from('Proton_Gas')
        .select('*')
        .eq('serial_number', serialNumber)
        .maybeSingle();
      
      if (deviceCheckError) {
        throw deviceCheckError;
      }
      
      if (!existingDevice) {
        throw new Error('Device with this serial number not found in our database');
      }
      
      let deviceId: string;
      
      // If device exists, check if it's already assigned to a user
      if (existingDevice.user_id && existingDevice.user_id !== user.id) {
        throw new Error('This device is already registered to another user');
      } else if (existingDevice.user_id === user.id) {
        throw new Error('You have already registered this device');
      } else {
        // Device exists but not assigned to any user, assign it to current user
        const { error: updateError } = await supabase
          .from('Proton_Gas')
          .update({ 
            user_id: user.id,
            device_name: name || `Tank ${serialNumber.slice(-4)}`
          })
          .eq('id', existingDevice.id);
        
        if (updateError) {
          throw updateError;
        }
        
        deviceId = existingDevice.id;
      }
      
      // Refresh devices to get the newly added device
      await refreshDevices();
      
      toast.success('Device added successfully');
    } catch (error) {
      console.error('Error adding device:', error);
      throw error;
    }
  };

  const removeDevice = async (deviceId: string) => {
    if (!user) throw new Error('You must be logged in to remove a device');
    
    try {
      // Just unlink the device from the user (don't delete it from database)
      const { error } = await supabase
        .from('Proton_Gas')
        .update({ user_id: null })
        .eq('id', deviceId)
        .eq('user_id', user.id);
      
      if (error) {
        throw error;
      }
      
      // Update local state by removing the device from the devices array
      setDevices(devices.filter(d => d.id !== deviceId));
      
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
