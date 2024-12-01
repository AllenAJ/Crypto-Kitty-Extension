import CryptoKittyDesigner from './components/CryptoKittyDesigner';
import { AuthProvider } from './contexts/AuthContext';
import AuthScreen from './components/AuthScreen';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 py-12">
        <AuthScreen />
        <div className="mt-8">
          <CryptoKittyDesigner />
        </div>
      </div>
    </AuthProvider>
  );
}

export default App;