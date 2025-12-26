import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './contexts/AuthContext';
import AuthGuard from './components/AuthGuard';
import AmbientMode from './components/AmbientMode';

const App = () => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthProvider>
        <AuthGuard>
          <AmbientMode />
        </AuthGuard>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
