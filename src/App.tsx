import React, { useState } from 'react';
import CryptoKittyDesigner from './components/CryptoKittyDesigner';
import { AuthProvider } from './contexts/AuthContext';
import AuthScreen from './components/AuthScreen';
import MenuScreen from './components/MenuScreen';
import { useAuth } from './contexts/AuthContext';

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<'menu' | 'designer'>('menu');

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <div className="h-[600px] bg-gray-50 flex flex-col overflow-hidden">
      {currentScreen === 'menu' ? (
        <MenuScreen onCustomize={() => setCurrentScreen('designer')} />
      ) : (
        <CryptoKittyDesigner onBack={() => setCurrentScreen('menu')} />
      )}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;