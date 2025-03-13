
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Device } from "@/types";
import GasLevelGauge from "./GasLevelGauge";
import { Gauge, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface DeviceCardProps {
  device: Device;
  expanded: boolean;
  onToggleExpand: () => void;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ 
  device,
  expanded,
  onToggleExpand
}) => {
  // Mock data for demo
  const mockReadings = [
    { time: "Mon", level: 88 },
    { time: "Tue", level: 82 },
    { time: "Wed", level: 76 },
    { time: "Thu", level: 70 },
    { time: "Fri", level: 64 },
    { time: "Sat", level: 58 },
    { time: "Sun", level: 52 },
  ];

  const gasLevel = device.lastReading?.level || 65; // Default for demo
  
  // Calculate predicted days remaining before empty
  const calculateDaysRemaining = () => {
    if (!mockReadings || mockReadings.length < 2) return "N/A";
    
    // Simple linear regression to predict days remaining
    const firstDay = mockReadings[0].level;
    const lastDay = mockReadings[mockReadings.length - 1].level;
    const daysElapsed = mockReadings.length - 1;
    
    if (firstDay === lastDay) return "Stable";
    
    const dailyRate = (firstDay - lastDay) / daysElapsed;
    if (dailyRate <= 0) return "Stable";
    
    const daysRemaining = Math.round(lastDay / dailyRate);
    return `~${daysRemaining} days`;
  };

  return (
    <Card className="w-full proton-card overflow-hidden animate-scale-in">
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Gauge className="h-5 w-5 text-proton" />
            {device.name || `Tank ${device.serialNumber}`}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onToggleExpand}>
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          <GasLevelGauge level={gasLevel} size="md" />
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Serial</span>
            <span className="font-mono text-xs">{device.serialNumber}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Remaining</span>
            <span className="font-medium">{calculateDaysRemaining()}</span>
          </div>
          
          {expanded && (
            <div className="pt-2 space-y-4 animate-slide-down">
              <Separator className="my-2" />
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">History</h4>
                <div className="h-[150px] w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockReadings}>
                      <XAxis dataKey="time" stroke="#666" fontSize={10} />
                      <YAxis domain={[0, 100]} stroke="#666" fontSize={10} />
                      <Tooltip 
                        contentStyle={{ background: 'rgba(17, 17, 17, 0.8)', border: 'none', borderRadius: '8px' }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="level" 
                        stroke="#F97316" 
                        strokeWidth={2}
                        dot={{ r: 3, fill: '#F97316' }}
                        activeDot={{ r: 5, fill: '#F97316' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Prediction</h4>
                <p className="text-xs text-muted-foreground">
                  Based on current usage patterns, your tank will need refilling in approximately {calculateDaysRemaining()}.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DeviceCard;
