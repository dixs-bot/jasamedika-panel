import React, { createContext, useContext } from 'react';
const AuthContext = createContext();

const host = (typeof window !== 'undefined' && window.location && window.location.hostname) ? window.location.hostname : 'localhost';
export const BASE_API = `http://${host}:8080`;

export const AuthProvider = ({ children }) => {
  const login = async (email, password) => {
    try {
      const res = await fetch(`${BASE_API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const text = await res.text();
      let data;
      try { data = text ? JSON.parse(text) : {}; } catch (e) {
        return { success: false, error: 'Invalid JSON response from server: ' + text };
      }
      if (!res.ok) return { success: false, error: data.message || data.error || 'Login failed' };
      const token = data?.hasil?.token || data?.token;
      if (token) localStorage.setItem('token', token);
      return { success: true, hasil: data.hasil || data };
    } catch (err) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const logout = () => { try { localStorage.removeItem('token'); } catch(e){} };

  return <AuthContext.Provider value={{ login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
