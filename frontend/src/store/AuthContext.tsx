import React, { createContext, useContext, useState, useEffect } from 'react';
import client from '../api/client';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'ADMIN';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: Omit<User, 'id'> & { password: string }) => Promise<void>;
  logout: () => void;
  loading: boolean;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('sis_token'));
  const [loading, setLoading] = useState(true);

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('sis_token');
  };

  useEffect(() => {
    const fetchMe = async () => {
      if (token) {
        try {
          const res = await client.get('/auth/me');
          setUser(res.data.user);
        } catch {
          logout();
        }
      }
      setLoading(false);
    };
    fetchMe();
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await client.post('/auth/login', { email, password });
    const { user: userData, token: userToken } = res.data;
    setToken(userToken);
    setUser(userData);
    localStorage.setItem('sis_token', userToken);
  };

  const signup = async (data: Omit<User, 'id'> & { password: string }) => {
    const res = await client.post('/auth/signup', data);
    const { user: userData, token: userToken } = res.data;
    setToken(userToken);
    setUser(userData);
    localStorage.setItem('sis_token', userToken);
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
        const res = await client.patch('/auth/profile', userData);
        setUser(prev => prev ? { ...prev, ...res.data.user } : null);
    } catch (error) {
        console.error("Failed to update profile", error);
        throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
