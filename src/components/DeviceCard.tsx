
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Device, GasReading } from "@/types";
import GasLevelGauge from "./GasLevelGauge";
import { Gauge, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

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
  const [readings, setReadings] = useState<GasReading[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (expanded && device.id) {
      fetchReadings();
    }
  }, [expanded, device.id]);
  
  const fetchReadings = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('gas_history')
        .select('*')
        .eq('device_id', device.id)
        .order('timestamp', { ascending: false })
        .limit(7);
        
      if (error) {
        throw error;
      }
      
      if (data) {
        // Convert to our GasReading type and sort chronologically
        const mappedReadings: GasReading[] = data
          .map(reading => ({
            id: reading.id,
            deviceId: reading.device_id,
            level: reading.gas_level,
            timestamp: reading.timestamp
          }))
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          
        setReadings(mappedReadings);
      }
    } catch (error) {
      console.error('Error fetching readings:', error);
    } finally {
      setLoading(false);
    }
  };

  const gasLevel = device.lastReading?.level || 0;
  
  // Prepare data for chart
  const chartData = readings.map(reading => ({
    time: format(new Date(reading.timestamp), 'EEE'),
    level: reading.level
  }));
  
  // Calculate predicted days remaining before empty
  const calculateDaysRemaining = () => {
    if (!readings || readings.length < 2) return "N/A";
    
    // Simple linear regression to predict days remaining
    const sortedReadings = [...readings].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    const firstDay = sortedReadings[0].level;
    const lastDay = sortedReadings[sortedReadings.length - 1].level;
    const daysElapsed = (
      new Date(sortedReadings[sortedReadings.length - 1].timestamp).getTime() -
      new Date(sortedReadings[0].timestamp).getTime()
    ) / (1000 * 60 * 60 * 24);
    
    if (firstDay === lastDay) return "Stable";
    
    const dailyRate = (firstDay - lastDay) / Math.max(1, daysElapsed);
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
            {device.name || `Tank ${device.serialNumber.slice(-4)}`}
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
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-sm text-muted-foreground">Loading data...</p>
                    </div>
                  ) : readings.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
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
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-sm text-muted-foreground">No historical data available</p>
                    </div>
                  )}
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
