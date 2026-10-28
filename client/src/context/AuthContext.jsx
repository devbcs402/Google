import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleExpired = () => setUser(null);
    window.addEventListener('auth:expired', handleExpired);
    const token = localStorage.getItem('evm-token');
    if (!token) {
      setLoading(false);
    } else {
      api.get('/auth/me')
        .then(({ data }) => setUser(data.user))
        .catch(() => localStorage.removeItem('evm-token'))
        .finally(() => setLoading(false));
    }
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    async signIn(credentials) {
      const { data } = await api.post('/auth/login', credentials);
      localStorage.setItem('evm-token', data.token);
      setUser(data.user);
      return data.user;
    },
    async signUp(details) {
      const { data } = await api.post('/auth/register', details);
      localStorage.setItem('evm-token', data.token);
      setUser(data.user);
      return data.user;
    },
    async updateUser(details) {
      const { data } = await api.patch('/auth/me', details);
      setUser(data.user);
      return data.user;
    },
    signOut() {
      localStorage.removeItem('evm-token');
      setUser(null);
    }
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider.');
  return context;
}
