import React, { useState, useEffect } from "react";
import { auth, db, googleProvider } from "../../firebase";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { ref, set, get, update } from "firebase/database";
import { useNavigate } from "react-router-dom";

export default function SignUp() {
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(0);
  const [nextImage, setNextImage] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isBuyer, setIsBuyer] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    idNumber: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    location: "",
  });
  const [idFront, setIdFront] = useState(null);
  const [idBack, setIdBack] = useState(null);

  const images = [
    "/images/login1.jpg",
    "/images/login2.jpg",
    "/images/login3.jpg",
    "/images/login4.jpg"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      startTransition();
    }, 5000);
    return () => clearInterval(interval);
  }, [currentImage, images.length]);

  const startTransition = () => {
    setIsTransitioning(true);
    const next = (currentImage + 1) % images.length;
    setNextImage(next);
    
    // Reset transition after animation completes
    setTimeout(() => {
      setCurrentImage(next);
      setIsTransitioning(false);
    }, 1000);
  };

  const handleImageChange = (index) => {
    if (index === currentImage || isTransitioning) return;
    setIsTransitioning(true);
    setNextImage(index);
    
    setTimeout(() => {
      setCurrentImage(index);
      setIsTransitioning(false);
    }, 1000);
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSignUp = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const uid = userCredential.user.uid;

      const frontURL = null;
      const backURL = null;

      if (auth.currentUser && auth.currentUser.getIdToken) {
        try {
          await auth.currentUser.getIdToken(true);
        } catch (tokenErr) {
          console.warn("token refresh failed", tokenErr);
        }
      }

      const role = isBuyer ? "buyer" : "fisher";
      await set(ref(db, "users/" + uid), {
        ...formData,
        idFrontUrl: frontURL,
        idBackUrl: backURL,
        role,
        kycStatus: isBuyer ? "not_submitted" : "pending",
      });

      if (isBuyer) navigate("/buyer-dashboard");
      else navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

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
        if (isBuyer && data.role !== "buyer") {
          await update(userRef, { role: "buyer", kycStatus: "not_submitted" });
        }
      }

      if (isBuyer) navigate("/buyer-dashboard");
      else navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
        alert("Please fill all required fields");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        alert("Passwords do not match!");
        return;
      }
    }
    if (currentStep === 2) {
      if (!formData.idNumber || !formData.phone || !formData.location) {
        alert("Please fill all required fields");
        return;
      }
    }
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => setCurrentStep(currentStep - 1);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center relative overflow-hidden py-12 px-4">
      {/* Enhanced Animated Background Slideshow */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Current Image */}
        <div
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
            isTransitioning ? 'opacity-0 scale-110' : 'opacity-100 scale-100'
          }`}
        >
          <img
            src={images[currentImage]}
            alt={`Ocean scene ${currentImage + 1}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/85 via-blue-900/70 to-cyan-900/75"></div>
        </div>

        {/* Next Image */}
        <div
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
            isTransitioning ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
          }`}
        >
          <img
            src={images[nextImage]}
            alt={`Ocean scene ${nextImage + 1}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/85 via-blue-900/70 to-cyan-900/75"></div>
        </div>

        {/* Animated Overlay Gradient */}
        <div className="absolute inset-0">
          <div className={`absolute inset-0 bg-gradient-to-r from-blue-600/10 to-cyan-600/10 transition-all duration-2000 ${
            isTransitioning ? 'opacity-100' : 'opacity-60'
          }`}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 via-transparent to-gray-900/40"></div>
        </div>
      </div>

      {/* Animated Waves */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-24 opacity-20">
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            className="fill-current text-cyan-400"
            style={{ animation: "wave 8s ease-in-out infinite" }}
          />
        </svg>
      </div>

      {/* Floating Bubbles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-cyan-400/10 border border-cyan-400/20"
            style={{
              width: `${Math.random() * 50 + 15}px`,
              height: `${Math.random() * 50 + 15}px`,
              left: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 15 + 10}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
              bottom: "-100px",
            }}
          />
        ))}
      </div>

      {/* Sign Up Card */}
      <div className="relative z-10 w-full max-w-2xl">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500 rounded-2xl blur-xl opacity-60 animate-pulse"></div>
              <div className="relative w-16 h-16 bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <span className="text-3xl">🌊</span>
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Join BlueChain AI
            </span>
          </h1>
          <p className="text-gray-300 text-sm">Empowering Coastal Communities Together</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                  currentStep >= step 
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 border-cyan-400 shadow-lg shadow-cyan-500/50' 
                    : 'bg-gray-800 border-gray-600'
                }`}>
                  <span className={`font-bold ${currentStep >= step ? 'text-white' : 'text-gray-500'}`}>
                    {step}
                  </span>
                </div>
                {step < 3 && (
                  <div className={`w-12 h-1 mx-2 rounded transition-all duration-300 ${
                    currentStep > step ? 'bg-gradient-to-r from-cyan-500 to-blue-600' : 'bg-gray-700'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-3 space-x-8 text-xs text-gray-400">
            <span className={currentStep === 1 ? 'text-cyan-400 font-semibold' : ''}>Account</span>
            <span className={currentStep === 2 ? 'text-cyan-400 font-semibold' : ''}>Details</span>
            <span className={currentStep === 3 ? 'text-cyan-400 font-semibold' : ''}>Verification</span>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-gray-800/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/50 p-8">
          <form onSubmit={handleSignUp}>
            {/* Step 1: Account Information */}
            {currentStep === 1 && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Create Account</h3>
                  <p className="text-gray-400 text-sm mb-6">Let's get you started with the basics</p>
                </div>

                {/* Full Name */}
                <div className="group">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-400 text-lg">👤</span>
                    </div>
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full bg-gray-900/50 border border-gray-600 text-white pl-12 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 placeholder-gray-500"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="group">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-400 text-lg">📧</span>
                    </div>
                    <input
                      type="email"
                      name="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-gray-900/50 border border-gray-600 text-white pl-12 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 placeholder-gray-500"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="group">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-400 text-lg">🔒</span>
                    </div>
                    <input
                      type="password"
                      name="password"
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full bg-gray-900/50 border border-gray-600 text-white pl-12 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 placeholder-gray-500"
                      required
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="group">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm Password <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-400 text-lg">🔒</span>
                    </div>
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full bg-gray-900/50 border border-gray-600 text-white pl-12 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 placeholder-gray-500"
                      required
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={nextStep}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-[1.02] flex items-center justify-center group"
                >
                  <span>Continue</span>
                  <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                </button>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-gray-800/40 text-gray-400">Or sign up with</span>
                  </div>
                </div>

                {/* Google Sign Up */}
                <button
                  type="button"
                  onClick={handleGoogleSignUp}
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-3 bg-white hover:bg-gray-100 text-gray-900 font-semibold py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Sign up with Google</span>
                </button>
              </div>
            )}

            {/* Step 2: Personal Details */}
            {currentStep === 2 && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Personal Details</h3>
                  <p className="text-gray-400 text-sm mb-6">Tell us more about yourself</p>
                </div>

                {/* ID Number */}
                <div className="group">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    National ID Number <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-400 text-lg">🆔</span>
                    </div>
                    <input
                      type="text"
                      name="idNumber"
                      placeholder="Enter your ID number"
                      value={formData.idNumber}
                      onChange={handleChange}
                      className="w-full bg-gray-900/50 border border-gray-600 text-white pl-12 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 placeholder-gray-500"
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="group">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-400 text-lg">📱</span>
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="+254 700 000 000"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full bg-gray-900/50 border border-gray-600 text-white pl-12 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 placeholder-gray-500"
                      required
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="group">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Location <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-400 text-lg">📍</span>
                    </div>
                    <input
                      type="text"
                      name="location"
                      placeholder="Your location/region"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full bg-gray-900/50 border border-gray-600 text-white pl-12 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 placeholder-gray-500"
                      required
                    />
                  </div>
                </div>

                {/* Account Type */}
                <div className="bg-gray-900/50 border border-gray-600 rounded-xl p-4">
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={isBuyer}
                      onChange={(e) => setIsBuyer(e.target.checked)}
                      className="w-5 h-5 text-cyan-500 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500 focus:ring-2"
                    />
                    <div className="ml-3">
                      <span className="text-white font-medium group-hover:text-cyan-400 transition-colors">
                        I am a Buyer
                      </span>
                      <p className="text-gray-400 text-xs">Check this if you're signing up as a buyer/investor</p>
                    </div>
                  </label>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 rounded-xl transition-all duration-300"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-[1.02]"
                  >
                    Continue →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Verification */}
            {currentStep === 3 && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Verification</h3>
                  <p className="text-gray-400 text-sm mb-6">Upload your ID for verification</p>
                </div>

                {/* ID Front */}
                <div className="group">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    ID Front Photo <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setIdFront(e.target.files[0])}
                      className="hidden"
                      id="idFront"
                      required
                    />
                    <label
                      htmlFor="idFront"
                      className="w-full bg-gray-900/50 border-2 border-dashed border-gray-600 hover:border-cyan-500 text-gray-400 hover:text-cyan-400 py-8 rounded-xl transition-all duration-300 cursor-pointer flex flex-col items-center justify-center group"
                    >
                      <span className="text-4xl mb-2">📷</span>
                      <span className="font-medium">
                        {idFront ? idFront.name : "Click to upload ID front"}
                      </span>
                      <span className="text-xs mt-1">JPG, PNG or JPEG (max 5MB)</span>
                    </label>
                  </div>
                </div>

                {/* ID Back */}
                <div className="group">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    ID Back Photo <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setIdBack(e.target.files[0])}
                      className="hidden"
                      id="idBack"
                      required
                    />
                    <label
                      htmlFor="idBack"
                      className="w-full bg-gray-900/50 border-2 border-dashed border-gray-600 hover:border-cyan-500 text-gray-400 hover:text-cyan-400 py-8 rounded-xl transition-all duration-300 cursor-pointer flex flex-col items-center justify-center group"
                    >
                      <span className="text-4xl mb-2">📷</span>
                      <span className="font-medium">
                        {idBack ? idBack.name : "Click to upload ID back"}
                      </span>
                      <span className="text-xs mt-1">JPG, PNG or JPEG (max 5MB)</span>
                    </label>
                  </div>
                </div>

                {/* Terms */}
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
                  <p className="text-blue-300 text-sm">
                    <span className="font-semibold">Note:</span> Your ID will be securely stored and used only for verification purposes in compliance with data protection regulations.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 rounded-xl transition-all duration-300"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg shadow-green-500/30 hover:shadow-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Registering...
                      </>
                    ) : (
                      <>
                        Complete Sign Up ✓
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/")}
            className="text-gray-400 hover:text-cyan-400 text-sm transition-colors flex items-center justify-center mx-auto group"
          >
            <span className="mr-2 group-hover:-translate-x-1 transition-transform duration-300">←</span>
            Back to Home
          </button>
        </div>
      </div>

      {/* Enhanced Image Indicator Dots */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => handleImageChange(idx)}
            disabled={isTransitioning}
            className={`w-3 h-3 rounded-full transition-all duration-500 ${
              currentImage === idx 
                ? 'bg-cyan-400 scale-125 shadow-lg shadow-cyan-400/50' 
                : 'bg-gray-500 hover:bg-gray-400'
            } ${isTransitioning ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes wave {
          0%, 100% { transform: translateX(0) scaleY(1); }
          50% { transform: translateX(-20%) scaleY(0.8); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
        @keyframes slideIn {
          0% { transform: translateX(100%) scale(1.1); opacity: 0; }
          100% { transform: translateX(0) scale(1); opacity: 1; }
        }
        @keyframes slideOut {
          0% { transform: translateX(0) scale(1); opacity: 1; }
          100% { transform: translateX(-100%) scale(0.9); opacity: 0; }
        }
      `}</style>
    </div>
  );
}