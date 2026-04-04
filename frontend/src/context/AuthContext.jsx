import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const DEMO_USERS = {
  admin: { password: 'admin123', role: 'admin', name: 'Dr. Rajesh Kumar', title: 'Hospital Administrator' },
  doctor: { password: 'doctor123', role: 'doctor', name: 'Dr. Priya Sharma', title: 'ICU Attending Physician' },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('omnkavach_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      sessionStorage.setItem('omnkavach_user', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('omnkavach_user');
    }
  }, [user]);

  const login = (username, password) => {
    const entry = DEMO_USERS[username.toLowerCase()];
    if (!entry) return { success: false, error: 'User not found' };
    if (entry.password !== password) return { success: false, error: 'Incorrect password' };

    const userData = { username: username.toLowerCase(), role: entry.role, name: entry.name, title: entry.title };
    setUser(userData);
    return { success: true };
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
