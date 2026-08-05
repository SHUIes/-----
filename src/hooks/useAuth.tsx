import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { scopedStorage } from '@lark-apaas/client-toolkit-lite';

const PASSWORD_KEY = 'league_password';
const AUTH_KEY = 'league_logged_in';

interface AuthContextType {
  isAuthenticated: boolean;
  hasPassword: boolean;
  login: (password: string) => boolean;
  setInitialPassword: (password: string) => boolean;
  changePassword: (oldPwd: string, newPwd: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [hasPassword, setHasPassword] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // 初始化时从 localStorage 读取状态，兼容旧版 __twb_ 前缀
  useEffect(() => {
    let pwd = scopedStorage.getItem(PASSWORD_KEY);
    if (!pwd) {
      const legacy = scopedStorage.getItem('__twb_password');
      if (legacy) {
        scopedStorage.setItem(PASSWORD_KEY, legacy);
        pwd = legacy;
      }
    }
    setHasPassword(!!pwd);

    let authed = scopedStorage.getItem(AUTH_KEY) === '1';
    if (!authed && scopedStorage.getItem('__twb_auth') === '1') {
      scopedStorage.setItem(AUTH_KEY, '1');
      authed = true;
    }
    setIsAuthenticated(authed && !!pwd);
  }, []);

  const login = useCallback((password: string) => {
    const stored = scopedStorage.getItem(PASSWORD_KEY);
    if (stored && password === stored) {
      scopedStorage.setItem(AUTH_KEY, '1');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const setInitialPassword = useCallback((password: string) => {
    if (!password || password.length < 4) return false;
    scopedStorage.setItem(PASSWORD_KEY, password);
    scopedStorage.setItem(AUTH_KEY, '1');
    setHasPassword(true);
    setIsAuthenticated(true);
    return true;
  }, []);

  const changePassword = useCallback((oldPwd: string, newPwd: string) => {
    const stored = scopedStorage.getItem(PASSWORD_KEY);
    if (stored !== oldPwd) return false;
    if (!newPwd || newPwd.length < 4) return false;
    scopedStorage.setItem(PASSWORD_KEY, newPwd);
    return true;
  }, []);

  const logout = useCallback(() => {
    scopedStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, hasPassword, login, setInitialPassword, changePassword, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
