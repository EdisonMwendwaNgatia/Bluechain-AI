import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLocation, useNavigate } from 'react-router-dom';
import { ref, get } from 'firebase/database';
import { db } from '../firebase';

export default function AuthGuard() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    // Only run redirect from public routes
    const publicPaths = ['/', '/login', '/signup', '/landing'];
    if (!publicPaths.includes(location.pathname)) return;
    if (!user) return; // not signed in

    (async () => {
      try {
        const snap = await get(ref(db, `users/${user.uid}/role`));
        const role = snap.exists() ? snap.val() : 'fisher';
        if (role === 'buyer') navigate('/buyer-dashboard');
        else navigate('/dashboard');
      } catch (err) {
        console.error('AuthGuard error', err);
        navigate('/dashboard');
      }
    })();
  }, [user, loading, location.pathname, navigate]);

  return null;
}
