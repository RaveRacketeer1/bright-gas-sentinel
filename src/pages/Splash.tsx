
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Flame } from "lucide-react";

const Splash = () => {
  const navigate = useNavigate();
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
      setTimeout(() => {
        navigate('/auth');
      }, 500); // Small delay after fade out
    }, 3000); // 3 seconds

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <div 
        className={`flex flex-col items-center transition-opacity duration-500 ${
          animationComplete ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="relative w-24 h-24 mb-4">
          <div className="absolute inset-0 bg-proton opacity-20 rounded-full animate-pulse-subtle" />
          <div className="absolute inset-3 bg-proton opacity-40 rounded-full animate-pulse-subtle [animation-delay:150ms]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Flame className="h-12 w-12 text-proton animate-float" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold tracking-tight animate-fade-in text-gradient-primary">
          Proton Gas
        </h1>
        
        <p className="text-muted-foreground text-sm mt-2 animate-fade-in [animation-delay:300ms]">
          Monitor your gas levels
        </p>
      </div>
    </div>
  );
};

export default Splash;
