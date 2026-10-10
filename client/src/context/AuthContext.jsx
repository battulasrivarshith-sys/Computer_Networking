import { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('vault_token'));
  const [loading, setLoading] = useState(true);

  // Restore the session on page load using the stored JWT
  useEffect(() => {
    (async () => {
      if (!token) return setLoading(false);
      try {
        const { user } = await api.me(token);
        setUser(user);
      } catch {
        localStorage.removeItem('vault_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const login = useCallback(async (credentials) => {
    const res = await api.login(credentials);
    localStorage.setItem('vault_token', res.token);
    setToken(res.token);
    setUser(res.user);
  }, []);

  const register = useCallback(async (payload) => {
    const res = await api.register(payload);
    localStorage.setItem('vault_token', res.token);
    setToken(res.token);
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('vault_token');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
