
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { Flame, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 animate-scale-in">
        <div className="flex justify-center">
          <Flame className="h-16 w-16 text-proton opacity-75" />
        </div>
        <h1 className="text-4xl font-bold text-gradient-primary">404</h1>
        <p className="text-xl text-muted-foreground mb-4">
          This page has evaporated
        </p>
        <Button
          className="proton-btn"
          onClick={() => navigate("/")}
        >
          <Home className="h-4 w-4 mr-2" />
          Return Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
