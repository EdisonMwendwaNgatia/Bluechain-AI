import React, { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { ref, set, get } from "firebase/database";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";

export default function BuyerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({ company: "", name: "", purchases: "" });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const snap = await get(ref(db, `users/${user.uid}/buyerProfile`));
      if (snap.exists()) setProfile(snap.val());
    })();
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await set(ref(db, `users/${user.uid}/buyerProfile`), profile);
      // navigate to buyer dashboard main view or a buyers area
      alert("Buyer profile saved");
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="buyer-dashboard">
      <h2>Buyer Profile</h2>
      <p>Please complete your buyer profile to access buyer features.</p>
      <label>Company (optional)</label>
      <input value={profile.company} onChange={(e) => setProfile({ ...profile, company: e.target.value })} />
      <label>Name</label>
      <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
      <label>What you typically buy</label>
      <select value={profile.purchases} onChange={(e) => setProfile({ ...profile, purchases: e.target.value })}>
        <option value="">Select...</option>
        <option value="tilapia">Tilapia</option>
        <option value="mackerel">Mackerel</option>
        <option value="sardines">Sardines</option>
        <option value="mixed">Mixed species</option>
      </select>
      <div>
        <button onClick={saveProfile} disabled={loading}>{loading ? 'Saving...' : 'Save and Continue'}</button>
      </div>
    </div>
  );
}
