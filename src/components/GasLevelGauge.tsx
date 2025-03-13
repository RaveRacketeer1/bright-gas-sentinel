
import React from "react";
import { cn } from "@/lib/utils";

interface GasLevelGaugeProps {
  level: number;
  className?: string;
  size?: "sm" | "md" | "lg";
  showPercentage?: boolean;
  animate?: boolean;
}

export const GasLevelGauge: React.FC<GasLevelGaugeProps> = ({
  level,
  className,
  size = "md",
  showPercentage = true,
  animate = true,
}) => {
  // Clamp the level between 0 and 100
  const clampedLevel = Math.max(0, Math.min(100, level));
  
  // Determine colors based on level
  const getColorClass = () => {
    if (clampedLevel <= 20) return "bg-red-500";
    if (clampedLevel <= 40) return "bg-amber-500";
    return "bg-proton";
  };
  
  // Size-based classes
  const sizeClasses = {
    sm: "h-2 w-full",
    md: "h-3 w-full",
    lg: "h-4 w-full",
  };

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="relative bg-secondary/70 rounded-full overflow-hidden">
        <div 
          className={cn(
            "absolute top-0 left-0 rounded-full transition-all duration-1000",
            getColorClass(),
            sizeClasses[size],
            animate && "animate-pulse-subtle"
          )}
          style={{ width: `${clampedLevel}%` }}
        />
        <div className={cn("invisible", sizeClasses[size])} />
      </div>
      
      {showPercentage && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Level</span>
          <span className="font-medium">{clampedLevel}%</span>
        </div>
      )}
    </div>
  );
};

export default GasLevelGauge;
