
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  className,
}) => {
  return (
    <Card className={cn("proton-card border-dashed", className)}>
      <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-secondary/50 flex items-center justify-center text-muted-foreground">
          {icon}
        </div>
        <div className="space-y-2">
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            {description}
          </p>
        </div>
        {action && <div className="pt-2">{action}</div>}
      </CardContent>
    </Card>
  );
};

export default EmptyState;
