import React, { useEffect, useState, createContext, useContext } from 'react';
import { User, Role } from '../types';
import { mockUsers } from '../mockData';
interface AuthContextType {
  user: User | null;
  login: (role: Role) => void;
  logout: () => void;
  isAuthenticated: boolean;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  // Check for saved user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('oron_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);
  const login = (role: Role) => {
    const mockUser = mockUsers.find((u) => u.role === role);
    if (mockUser) {
      setUser(mockUser);
      localStorage.setItem('oron_user', JSON.stringify(mockUser));
    }
  };
  const logout = () => {
    setUser(null);
    localStorage.removeItem('oron_user');
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user
      }}>
      
      {children}
    </AuthContext.Provider>);

};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};