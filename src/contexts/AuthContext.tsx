import React, { createContext, useContext, useState, useEffect } from 'react';
import { Magic } from 'magic-sdk';

interface AuthContextType {
  user: string | null;
  loading: boolean;
  login: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initialize Magic instance
const magic = new Magic(process.env.REACT_APP_MAGIC_PUBLISHABLE_KEY as string);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const isLoggedIn = await magic.user.isLoggedIn();
      if (isLoggedIn) {
        const { email } = await magic.user.getMetadata();
        setUser(email as string);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string) => {
    try {
      setLoading(true);
      await magic.auth.loginWithEmailOTP({ email });
      const { email: userEmail } = await magic.user.getMetadata();
      setUser(userEmail as string);
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await magic.user.logout();
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};