import React, { useState } from "react";
import { auth, db, googleProvider } from "../../firebase";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { ref, set, get, update } from "firebase/database";
import { useNavigate } from "react-router-dom";

export default function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    idNumber: "",
    phone: "",
    email: "",
    password: "",
    location: "",
  });
  const [_idFront, setIdFront] = useState(null);
  const [_idBack, setIdBack] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isBuyer, setIsBuyer] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const uid = userCredential.user.uid;

      // We accept files in the form UI but we will NOT push them anywhere to
      // avoid using Firebase Storage or storing large blobs in the DB.
      // Keep placeholders null so the system behaves as a "smoke" upload.
      const frontURL = null;
      const backURL = null;

      // Make sure the signed-in user has a fresh token before writing to RTDB.
      // This can avoid a timing-related permission-denied in some projects.
      if (auth.currentUser && auth.currentUser.getIdToken) {
        try {
          await auth.currentUser.getIdToken(true);
        } catch (tokenErr) {
          // ignore token refresh errors; the write will surface permission errors
          console.warn("token refresh failed", tokenErr);
        }
      }

      // Store user data without attaching the uploaded files.
      const role = isBuyer ? "buyer" : "fisher";
      await set(ref(db, "users/" + uid), {
        ...formData,
        idFrontUrl: frontURL,
        idBackUrl: backURL,
        role,
        kycStatus: isBuyer ? "not_submitted" : "pending",
      });

      // If buyer, redirect to buyer dashboard to complete profile, otherwise normal dashboard
      if (isBuyer) navigate("/buyer-dashboard");
      else navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Sign up / sign in with Google and create a minimal DB record if missing
  const handleGoogleSignUp = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const uid = user.uid;
      const userRef = ref(db, "users/" + uid);
      const snap = await get(userRef);
      if (!snap.exists()) {
        await set(userRef, {
          fullName: user.displayName || "",
          email: user.email || "",
          phone: user.phoneNumber || "",
          role: isBuyer ? "buyer" : "fisher",
          kycStatus: isBuyer ? "not_submitted" : "not_submitted",
          provider: "google",
        });
      } else {
        const data = snap.val() || {};
        // If the user checked buyer during signup and the DB doesn't reflect it,
        // update the role so they can continue to buyer flow.
        if (isBuyer && data.role !== "buyer") {
          await update(userRef, { role: "buyer", kycStatus: "not_submitted" });
        }
      }

      // Redirect according to the buyer checkbox (if checked, go to buyer flow)
      if (isBuyer) navigate("/buyer-dashboard");
      else navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup">
      <h2>BlueChain AI Sign Up</h2>
      <form onSubmit={handleSignUp}>
        <input name="fullName" placeholder="Full Name" onChange={handleChange} required />
        <input name="idNumber" placeholder="National ID" onChange={handleChange} required />
        <input name="phone" placeholder="Phone" onChange={handleChange} required />
        <input name="email" placeholder="Email" type="email" onChange={handleChange} required />
        <input name="password" placeholder="Password" type="password" onChange={handleChange} required />
        <input name="location" placeholder="Location" onChange={handleChange} required />

        <label>ID Front:</label>
        <input type="file" accept="image/*" onChange={(e) => setIdFront(e.target.files[0])} required />
        <label>ID Back:</label>
        <input type="file" accept="image/*" onChange={(e) => setIdBack(e.target.files[0])} required />
        <div className="checkbox-row">
          <label>
            <input type="checkbox" checked={isBuyer} onChange={(e) => setIsBuyer(e.target.checked)} /> I am a buyer
          </label>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "center" }}>
          <button type="submit" disabled={loading}>
            {loading ? "Registering..." : "Sign Up"}
          </button>
          <button type="button" onClick={handleGoogleSignUp} disabled={loading}>
            {loading ? "Please wait..." : "Sign up with Google"}
          </button>
        </div>
      </form>
    </div>
  );
}
