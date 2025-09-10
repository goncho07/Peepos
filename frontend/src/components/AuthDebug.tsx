import React from 'react';
import { useAuthStore } from '../store/authStore';

const AuthDebug: React.FC = () => {
  const { isAuthenticated, user, token } = useAuthStore();
  const localStorageToken = localStorage.getItem('auth_token');

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: '#f0f0f0',
      padding: '10px',
      border: '1px solid #ccc',
      borderRadius: '5px',
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 9999
    }}>
      <h4>Auth Debug Info</h4>
      <div><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</div>
      <div><strong>User:</strong> {user ? user.email : 'None'}</div>
      <div><strong>Zustand Token:</strong> {token ? `${token.substring(0, 20)}...` : 'None'}</div>
      <div><strong>LocalStorage Token:</strong> {localStorageToken ? `${localStorageToken.substring(0, 20)}...` : 'None'}</div>
      <div><strong>Tokens Match:</strong> {token === localStorageToken ? 'Yes' : 'No'}</div>
    </div>
  );
};

export default AuthDebug;