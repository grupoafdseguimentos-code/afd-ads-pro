import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getMe, login as loginRequest, logout as logoutRequest, register as registerRequest } from '../services/auth.js';
import { tokenStore } from '../services/tokenStore.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(tokenStore.getAccessToken()));

  useEffect(() => {
    if (!tokenStore.getAccessToken()) return;
    getMe()
      .then(setUser)
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    async login(payload) {
      const logged = await loginRequest(payload);
      setUser(logged);
      return logged;
    },
    async register(payload) {
      const created = await registerRequest(payload);
      setUser(created);
      return created;
    },
    async logout() {
      await logoutRequest(tokenStore.getRefreshToken());
      setUser(null);
    },
    setUser
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
