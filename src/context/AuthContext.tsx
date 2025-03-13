
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Mock authentication for now - in real app this would be Supabase auth
        const storedUser = localStorage.getItem('proton_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // This would be replaced with actual Supabase authentication
      // Mock successful login for demo
      const user: User = {
        id: 'user-' + Math.random().toString(36).substr(2, 9),
        email
      };
      
      // Store in localStorage for demo
      localStorage.setItem('proton_user', JSON.stringify(user));
      setUser(user);
      
      toast.success('Signed in successfully');
    } catch (error) {
      console.error('Error signing in:', error);
      toast.error('Failed to sign in. Please check your credentials.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // This would be replaced with actual Supabase authentication
      // Mock successful registration for demo
      const user: User = {
        id: 'user-' + Math.random().toString(36).substr(2, 9),
        email
      };
      
      // Store in localStorage for demo
      localStorage.setItem('proton_user', JSON.stringify(user));
      setUser(user);
      
      toast.success('Account created successfully');
    } catch (error) {
      console.error('Error signing up:', error);
      toast.error('Failed to create account. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      // This would be replaced with actual Supabase signOut
      localStorage.removeItem('proton_user');
      setUser(null);
      
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
