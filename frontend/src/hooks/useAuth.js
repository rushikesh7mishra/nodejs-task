import { useState, useEffect } from 'react';

function decodeJwt(token) {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    const json = decodeURIComponent(
      Array.prototype.map.call(atob(payload.replace(/-/g, '+').replace(/_/g, '/')), c =>
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      ).join('')
    );
    return JSON.parse(json);
  } catch (err) {
    console.error('Failed to decode token', err);
    return null;
  }
}

export function useAuth() {
  const [user, setUser] = useState(() => {
    const t = localStorage.getItem('token');
    if (!t) return null;
    const p = decodeJwt(t);
    if (!p) return null;
    return { id: p.id, role: p.role, token: t };
  });

  useEffect(() => {
    const onStorage = () => {
      const t = localStorage.getItem('token');
      if (!t) return setUser(null);
      const p = decodeJwt(t);
      if (!p) return setUser(null);
      setUser({ id: p.id, role: p.role, token: t });
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const login = (token) => {
    localStorage.setItem('token', token);
    const p = decodeJwt(token);
    setUser(p ? { id: p.id, role: p.role, token } : null);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return { user, login, logout };
}
