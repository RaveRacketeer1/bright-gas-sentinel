
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (serialNumber.trim() === "") {
      toast.error("Please enter a valid serial number");
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
              <Label htmlFor="serialNumber">Serial Number</Label>
              <Input
                id="serialNumber"
                placeholder="Enter device serial number"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                className="proton-input"
                required
              />
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
