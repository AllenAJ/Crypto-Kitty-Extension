import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, LogOut, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from './Alert';

const AuthScreen = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isFullPage, setIsFullPage] = useState(false);
  const { login, logout, user, isAuthenticated } = useAuth();

  useEffect(() => {
    // Check if we're in the full page view (tab) or popup
    setIsFullPage(window.innerWidth > 400);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setShowSuccess(false);
  
    try {
      await login(email);
      setShowSuccess(true);
      
      // If in auth tab, add a smooth transition before closing
      if (window.location.search.includes('auth=true')) {
        // Show success message for 1.5 seconds before closing
        await new Promise(resolve => setTimeout(resolve, 1500));
        window.close();
      }
    } catch (err) {
      setError('Failed to log in. Please check your email and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAuth = () => {
    setIsLoading(true); // Show loading state in popup
    
    chrome.tabs.create({ 
      url: chrome.runtime.getURL('index.html?auth=true'),
      active: true // Ensure the new tab becomes active
    }, () => {
      // Optional: close the popup after tab is opened
      window.close();
    });
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      setEmail('');
    } catch (err) {
      setError('Failed to log out. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated) {
    return (
      <div className="w-full max-w-md mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Welcome!</h2>
              <p className="text-gray-600 mt-1">You're ready to create kitties</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Mail className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-600">Logged in as</p>
            <p className="text-md font-medium text-gray-800 mt-1">{user}</p>
          </div>
          
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 
              py-3 px-4 rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <LogOut className="h-5 w-5" />
                Sign Out
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Show simplified view in popup
// In AuthScreen.tsx, update the non-full-page return statement
if (!isFullPage) {
  return (
    <div className="w-[400px] min-h-[600px] p-6 flex items-center justify-center">
      <button
        onClick={handleOpenAuth}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 bg-purple-600 
          text-white hover:bg-purple-700 py-3 px-4 rounded-xl font-medium 
          transition-all duration-300 transform hover:scale-102 
          active:scale-98 disabled:opacity-50"
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            <Mail className="h-5 w-5" />
            Login with Email
          </>
        )}
      </button>
    </div>
  );
}

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Create Your Kitty</h2>
          <p className="text-gray-600 mt-2">Sign in with magic link to start designing</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

{showSuccess && (
  <Alert 
    className="mb-6 bg-green-50 text-green-800 border-green-200 
      animate-in fade-in slide-in-from-top-4 duration-300"
  >
    <AlertTitle className="flex items-center gap-2">
      <CheckCircle2 className="h-5 w-5" />
      Success!
    </AlertTitle>
    <AlertDescription>
      You've been logged in successfully. This window will close automatically...
    </AlertDescription>
  </Alert>
)}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none 
                  focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="you@example.com"
                required
              />
              <Mail className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white hover:bg-purple-700 
              py-3 px-4 rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Continue with Email
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          We'll send you a magic link for password-free sign in
        </p>
      </div>
    </div>
  );
};

export default AuthScreen;