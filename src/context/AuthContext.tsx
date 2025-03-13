
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AuthError, Session } from '@supabase/supabase-js';

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
        setLoading(true);
        
        // Get session from Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (session) {
          handleSession(session);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Setup auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        handleSession(session);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    checkSession();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSession = (session: Session) => {
    // Map Supabase user to our User type
    setUser({
      id: session.user.id,
      email: session.user.email || ''
    });
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        throw error;
      }
      
      toast.success('Signed in successfully');
    } catch (error) {
      console.error('Error signing in:', error);
      toast.error(error instanceof AuthError ? error.message : 'Failed to sign in. Please check your credentials.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signUp({ 
        email, 
        password 
      });
      
      if (error) {
        throw error;
      }
      
      toast.success('Account created successfully. Please check your email to verify your account.');
    } catch (error) {
      console.error('Error signing up:', error);
      toast.error(error instanceof AuthError ? error.message : 'Failed to create account. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error(error instanceof AuthError ? error.message : 'Failed to sign out. Please try again.');
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
