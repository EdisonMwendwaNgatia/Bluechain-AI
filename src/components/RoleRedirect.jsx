import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ref, get } from 'firebase/database';
import { db } from '../firebase';

export default function RoleRedirect() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/');
      return;
    }

    (async () => {
      try {
        const snap = await get(ref(db, `users/${user.uid}/role`));
        const role = snap.exists() ? snap.val() : 'fisher';
        if (role === 'buyer') navigate('/buyer-dashboard');
        else navigate('/dashboard');
      } catch (err) {
        console.error('RoleRedirect error', err);
        navigate('/dashboard');
      }
    })();
  }, [user, loading, navigate]);

  return <div>Redirecting...</div>;
}
