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

  // Create or retrieve user document in Firebase
  const createOrGetUser = async (email: string) => {
    // Create a deterministic but unique ID from email
    const uid = btoa(email).replace(/[/+=]/g, '');
    const userRef = doc(db, 'users', uid);
    
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      // Create new user document if it doesn't exist
      await setDoc(userRef, {
        email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    return uid;
  };

  // Check user's authentication status
  const checkUser = async () => {
    try {
      // Check if we're in an auth callback URL
      const urlParams = new URLSearchParams(window.location.search);
      const isAuth = urlParams.get('auth');

      const isLoggedIn = await magic.user.isLoggedIn();
      
      if (isLoggedIn) {
        const { email } = await magic.user.getMetadata();
        if (email) {
          const uid = await createOrGetUser(email);
          setUser(email);
          setUserId(uid);

          // If this was opened as auth tab, close it after successful login
          if (isAuth) {
            window.close();
          }
        }
      }
    } catch (error) {
      console.error('Error checking user:', error);
      await logout();
    } finally {
      setLoading(false);
    }
  };

  // Check auth status on mount
  useEffect(() => {
    checkUser();
  }, []);

  // Handle login
  const login = async (email: string) => {
    try {
      setLoading(true);
      
      await magic.auth.loginWithEmailOTP({ email });
      const uid = await createOrGetUser(email);
      setUser(email);
      setUserId(uid);
  
      // Check if this is the auth tab
      const urlParams = new URLSearchParams(window.location.search);
      const isAuth = urlParams.get('auth');
  
      if (isAuth) {
        // Close this tab and focus on the extension
        chrome.runtime.sendMessage({ type: 'LOGIN_SUCCESS' });
        window.close();
      }
  
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const logout = async () => {
    try {
      setLoading(true);
      
      // Logout from Magic
      await magic.user.logout();
      
      // Clear user state
      setUser(null);
      setUserId(null);

      // Clear extension storage
      await chrome.storage.local.remove(['authUser', 'userId']);
      
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Initialize auth state from extension storage
  useEffect(() => {
    const initializeFromStorage = async () => {
      try {
        const { authUser, userId: storedUserId } = await chrome.storage.local.get([
          'authUser',
          'userId'
        ]);

        if (authUser) {
          setUser(authUser);
          setUserId(storedUserId);
        }
      } catch (error) {
        console.error('Error initializing from storage:', error);
      }
    };

    initializeFromStorage();
  }, []);

  // Context value
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

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};