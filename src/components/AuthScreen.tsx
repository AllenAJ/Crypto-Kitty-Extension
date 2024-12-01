import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, logout, user, isAuthenticated } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login(email);
    } catch (err) {
      setError('Failed to log in. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
      <div className="p-6 bg-white rounded-lg shadow-md">
        <p className="mb-4">Logged in as: {user}</p>
        <button
          onClick={handleLogout}
          disabled={isLoading}
          className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600 disabled:opacity-50"
        >
          {isLoading ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="mb-4 text-2xl font-bold">Login to Create Kitties</h2>
      <form onSubmit={handleLogin}>
        <div className="mb-4">
          <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Logging in...' : 'Login with Magic'}
        </button>
      </form>
    </div>
  );
};

export default AuthScreen;