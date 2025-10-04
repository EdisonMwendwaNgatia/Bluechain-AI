import React, { useState } from "react";
import { auth, googleProvider, db } from "../../firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { ref, get } from "firebase/database";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginEmail = async (e) => {
    e.preventDefault();
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;
      const snap = await get(ref(db, `users/${uid}/role`));
      const role = snap.exists() ? snap.val() : "fisher";
      if (role === "buyer") navigate("/buyer-dashboard");
      else navigate("/dashboard");
    } catch (error) {
      alert(error.message);
    }
  };

  const loginGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const uid = result.user.uid;
      const snap = await get(ref(db, `users/${uid}/role`));
      const role = snap.exists() ? snap.val() : "fisher";
      if (role === "buyer") navigate("/buyer-dashboard");
      else navigate("/dashboard");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="login">
      <h2>Login to BlueChain</h2>
      <form onSubmit={loginEmail}>
        <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Login</button>
      </form>
      <button onClick={loginGoogle}>Login with Google</button>
    </div>
  );
}
