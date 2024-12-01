import React, { createContext, useContext, useState, useEffect } from 'react';
import { Magic } from 'magic-sdk';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

interface AuthContextType {
  user: string | null;
  loading: boolean;
  login: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  userId: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initialize Magic instance
const magic = new Magic(process.env.REACT_APP_MAGIC_PUBLISHABLE_KEY as string);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const createOrGetUser = async (email: string) => {
    // Create a deterministic but unique ID from email
    const uid = btoa(email).replace(/[/+=]/g, '');
    const userRef = doc(db, 'users', uid);
    
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      await setDoc(userRef, {
        email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    return uid;
  };

  const checkUser = async () => {
    try {
      const isLoggedIn = await magic.user.isLoggedIn();
      if (isLoggedIn) {
        const { email } = await magic.user.getMetadata();
        if (email) {
          const uid = await createOrGetUser(email);
          setUser(email);
          setUserId(uid);
        }
      }
    } catch (error) {
      console.error('Error checking user:', error);
      await logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  const login = async (email: string) => {
    try {
      setLoading(true);
      await magic.auth.loginWithEmailOTP({ email });
      const uid = await createOrGetUser(email);
      setUser(email);
      setUserId(uid);
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
      setUserId(null);
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
    userId
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