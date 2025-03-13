
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
            name: `Tank ${device.serial_number.slice(-4)}`, // Default name based on serial
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
        throw new Error('Device with this serial number already exists');
      }
      
      // Check if the device exists in the database
      const { data: existingDevice, error: deviceCheckError } = await supabase
        .from('Proton_Gas')
        .select('*')
        .eq('serial_number', serialNumber)
        .maybeSingle();
      
      if (deviceCheckError) {
        throw deviceCheckError;
      }
      
      let deviceId: string;
      
      if (existingDevice) {
        // If device exists but not assigned to a user, assign it
        if (!existingDevice.user_id) {
          const { error: updateError } = await supabase
            .from('Proton_Gas')
            .update({ user_id: user.id })
            .eq('id', existingDevice.id);
          
          if (updateError) {
            throw updateError;
          }
          
          deviceId = existingDevice.id;
        } else if (existingDevice.user_id !== user.id) {
          throw new Error('This device is already registered to another user');
        } else {
          throw new Error('You have already registered this device');
        }
      } else {
        // Device doesn't exist, create a new one
        const { data: newDevice, error: insertError } = await supabase
          .from('Proton_Gas')
          .insert({
            serial_number: serialNumber,
            user_id: user.id,
            gas_level: Math.floor(Math.random() * 40) + 40 // Random initial level for demo
          })
          .select()
          .single();
        
        if (insertError) {
          throw insertError;
        }
        
        if (!newDevice) {
          throw new Error('Failed to create device');
        }
        
        deviceId = newDevice.id;
        
        // Create initial gas reading
        const { error: readingError } = await supabase
          .from('gas_history')
          .insert({
            device_id: deviceId,
            gas_level: newDevice.gas_level
          });
        
        if (readingError) {
          console.error('Error creating initial reading:', readingError);
        }
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
      // Just unlink the device from the user (don't delete it)
      const { error } = await supabase
        .from('Proton_Gas')
        .update({ user_id: null })
        .eq('id', deviceId)
        .eq('user_id', user.id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
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
