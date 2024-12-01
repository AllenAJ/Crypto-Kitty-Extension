import CryptoKittyDesigner from './components/CryptoKittyDesigner';
import { AuthProvider } from './contexts/AuthContext';
import AuthScreen from './components/AuthScreen';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <AuthScreen />
        <CryptoKittyDesigner />
      </div>
    </AuthProvider>
  );
}

export default App;