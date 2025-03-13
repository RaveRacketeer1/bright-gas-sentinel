
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Flame, LogOut, Plus, RefreshCw, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useDevices } from "@/context/DeviceContext";
import DeviceCard from "@/components/DeviceCard";
import EmptyState from "@/components/EmptyState";
import AddDeviceDialog from "@/components/AddDeviceDialog";
import InstallationGuide from "@/components/InstallationGuide";
import { Input } from "@/components/ui/input";

const Home = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { devices, loading, addDevice, refreshDevices } = useDevices();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [addDeviceOpen, setAddDeviceOpen] = useState(false);
  const [expandedDeviceId, setExpandedDeviceId] = useState<string | null>(null);
  
  // If not logged in, redirect to auth
  useEffect(() => {
    if (!user && !loading) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);
  
  // Filter devices based on search query
  const filteredDevices = devices.filter(device => 
    device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    device.serialNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleRefresh = async () => {
    await refreshDevices();
  };
  
  const handleAddDevice = async (serialNumber: string, name: string) => {
    await addDevice(serialNumber, name);
  };
  
  const handleExpandDevice = (deviceId: string) => {
    setExpandedDeviceId(prevId => prevId === deviceId ? null : deviceId);
  };
  
  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Flame className="h-8 w-8 text-proton animate-pulse" />
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Flame className="h-6 w-6 text-proton" />
            <h1 className="text-xl font-bold">Proton Gas</h1>
          </div>
          
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>
      
      <main className="container py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Your Devices</h2>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={handleRefresh}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              className="proton-btn"
              onClick={() => setAddDeviceOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Add Device
            </Button>
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search devices by name or serial number"
            className="pl-10 proton-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="space-y-4">
          {filteredDevices.length > 0 ? (
            filteredDevices.map((device) => (
              <DeviceCard
                key={device.id}
                device={device}
                expanded={expandedDeviceId === device.id}
                onToggleExpand={() => handleExpandDevice(device.id)}
              />
            ))
          ) : devices.length > 0 ? (
            <EmptyState
              title="No matches found"
              description="Try adjusting your search query to find your devices."
              icon={<Search className="h-6 w-6" />}
            />
          ) : (
            <EmptyState
              title="No devices added yet"
              description="Add your first device to start monitoring gas levels."
              icon={<Plus className="h-6 w-6" />}
              action={
                <Button 
                  className="proton-btn"
                  onClick={() => setAddDeviceOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  Add Your First Device
                </Button>
              }
            />
          )}
        </div>
        
        <Separator className="my-6" />
        
        <div className="pb-8">
          <h2 className="text-lg font-medium mb-4">Installation Guide</h2>
          <InstallationGuide />
        </div>
      </main>
      
      <AddDeviceDialog
        open={addDeviceOpen}
        onOpenChange={setAddDeviceOpen}
        onAddDevice={handleAddDevice}
      />
    </div>
  );
};

export default Home;
