
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AddDeviceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddDevice: (serialNumber: string, name: string) => Promise<void>;
}

const AddDeviceDialog: React.FC<AddDeviceDialogProps> = ({
  open,
  onOpenChange,
  onAddDevice,
}) => {
  const [serialNumber, setSerialNumber] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [availableDevices, setAvailableDevices] = useState<{id: string, serial_number: string}[]>([]);
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);

  // Fetch available devices when dialog opens
  useEffect(() => {
    if (open) {
      fetchAvailableDevices();
    }
  }, [open]);

  const fetchAvailableDevices = async () => {
    try {
      setIsLoadingDevices(true);
      // Fetch all devices from Proton_Gas table
      const { data, error } = await supabase
        .from('Proton_Gas')
        .select('id, serial_number')
        .is('user_id', null); // Only get unassigned devices
      
      if (error) {
        throw error;
      }
      
      setAvailableDevices(data || []);
    } catch (error) {
      console.error("Error fetching available devices:", error);
      toast.error("Failed to load available devices");
    } finally {
      setIsLoadingDevices(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (serialNumber.trim() === "") {
      toast.error("Please select a device");
      return;
    }
    
    try {
      setIsLoading(true);
      await onAddDevice(serialNumber.trim(), deviceName.trim() || `Tank ${serialNumber.slice(-4)}`);
      
      // Reset form
      setSerialNumber("");
      setDeviceName("");
      onOpenChange(false);
      
      toast.success("Device added successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add device");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Device</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="serialNumber">Select Device</Label>
              {isLoadingDevices ? (
                <div className="text-sm text-muted-foreground">Loading available devices...</div>
              ) : availableDevices.length > 0 ? (
                <Select onValueChange={setSerialNumber} value={serialNumber}>
                  <SelectTrigger className="proton-input">
                    <SelectValue placeholder="Select a device" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDevices.map((device) => (
                      <SelectItem key={device.id} value={device.serial_number}>
                        {device.serial_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No available devices found. You can manually enter a serial number below.
                </div>
              )}

              {availableDevices.length === 0 && (
                <Input
                  id="serialNumber"
                  placeholder="Enter device serial number"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  className="proton-input mt-2"
                />
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deviceName">Device Name (Optional)</Label>
              <Input
                id="deviceName"
                placeholder="E.g., Kitchen Tank"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                className="proton-input"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="submit" 
              className="proton-btn w-full"
              disabled={isLoading}
            >
              {isLoading ? "Adding..." : "Add Device"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDeviceDialog;
