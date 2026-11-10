import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { AuthUser } from './auth';
import { getCurrentUser } from './auth';

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const next = await getCurrentUser();
    setUser(next);
  }, []);

  useEffect(() => {
    let cancelled = false;

    getCurrentUser()
      .then((next) => {
        if (!cancelled) setUser(next);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => ({ user, loading, refresh }), [user, loading, refresh]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
