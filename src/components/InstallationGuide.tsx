
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Info, Magnet, Wrench, ShieldCheck } from "lucide-react";

const InstallationGuide: React.FC = () => {
  const steps = [
    {
      icon: <Magnet className="h-5 w-5 text-proton" />,
      title: "Non-Contact Measurement",
      description: "The device uses a magnetometer to measure the needle's position without direct contact with the tank or valve, ensuring safety."
    },
    {
      icon: <Wrench className="h-5 w-5 text-proton" />,
      title: "Easy Installation",
      description: "Mount the device using the two included screws. Position it directly over the gauge's needle for accurate readings."
    },
    {
      icon: <ShieldCheck className="h-5 w-5 text-proton" />,
      title: "Safety First",
      description: "The device operates completely externally to your gas system, posing no risk of gas leaks or system interference."
    }
  ];

  return (
    <Card className="w-full proton-card">
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Info className="h-5 w-5 text-proton" />
          Installation Guide
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              {index > 0 && <Separator className="my-4" />}
              <div className="flex gap-3">
                <div className="mt-0.5">
                  {step.icon}
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-medium">{step.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default InstallationGuide;
