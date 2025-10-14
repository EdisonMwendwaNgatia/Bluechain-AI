import React, { useState, useEffect } from "react";
import { auth, googleProvider, db } from "../../firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { ref, get } from "firebase/database";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [currentImage, setCurrentImage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const images = [
    "/images/login1.jpg",
    "/images/login2.jpg",
    "/images/login3.jpg",
    "/images/login4.jpg"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [images.length]);

  const loginEmail = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;
      const snap = await get(ref(db, `users/${uid}/role`));
      const role = snap.exists() ? snap.val() : "fisher";
      if (role === "buyer") navigate("/buyer-dashboard");
      else navigate("/dashboard");
    } catch (error) {
      alert(error.message);
      setIsLoading(false);
    }
  };

  const loginGoogle = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const uid = result.user.uid;
      const snap = await get(ref(db, `users/${uid}/role`));
      const role = snap.exists() ? snap.val() : "fisher";
      if (role === "buyer") navigate("/buyer-dashboard");
      else navigate("/dashboard");
    } catch (error) {
      alert(error.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center relative overflow-hidden">
      {/* Animated Background Slideshow with Ken Burns Effect */}
      <div className="absolute inset-0">
        {images.map((img, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-all duration-[2000ms] ease-in-out ${
              currentImage === idx ? "opacity-100 scale-100" : "opacity-0 scale-110"
            }`}
            style={{
              animation: currentImage === idx ? "kenBurns 6s ease-in-out" : "none"
            }}
          >
            <img
              src={img}
              alt={`Ocean scene ${idx + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900/85 via-blue-900/70 to-cyan-900/75"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
          </div>
        ))}
      </div>

      {/* Animated Ocean Waves */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-5">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-32">
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            className="fill-current text-cyan-500/20"
            style={{ animation: "wave 10s ease-in-out infinite" }}
          />
          <path
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
            className="fill-current text-blue-500/30"
            style={{ animation: "wave 15s ease-in-out infinite", animationDelay: "-2s" }}
          />
        </svg>
      </div>

      {/* Floating Bubbles with Advanced Animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 80 + 20}px`,
              height: `${Math.random() * 80 + 20}px`,
              left: `${Math.random() * 100}%`,
              background: `radial-gradient(circle at 30% 30%, rgba(6, 182, 212, ${Math.random() * 0.3 + 0.1}), rgba(59, 130, 246, ${Math.random() * 0.2}))`,
              border: `1px solid rgba(6, 182, 212, ${Math.random() * 0.4 + 0.1})`,
              animation: `floatBubble ${Math.random() * 20 + 15}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 10}s`,
              bottom: "-150px",
              boxShadow: `0 0 ${Math.random() * 30 + 10}px rgba(6, 182, 212, 0.3)`
            }}
          />
        ))}
      </div>

      {/* Main Content Container */}
      <div className="relative z-20 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding */}
          <div className="hidden lg:block text-white space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-3 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-cyan-500 rounded-3xl blur-2xl opacity-60 animate-pulse"></div>
                  <div className="relative w-20 h-20 bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl transform hover:rotate-12 transition-transform duration-500">
                    <span className="text-4xl">🌊</span>
                  </div>
                </div>
                <div>
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
                    BlueChain AI
                  </h1>
                  <p className="text-cyan-300 text-sm mt-1">Empowering Coastal Communities</p>
                </div>
              </div>
              
              <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
                Welcome to the
                <span className="block mt-2 bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                  Blue Economy Revolution
                </span>
              </h2>
              
              <p className="text-xl text-gray-300 leading-relaxed">
                Join thousands of coastal communities using blockchain and AI to create 
                sustainable livelihoods and protect our oceans.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-4">
              {[
                { icon: "🔗", text: "Blockchain-verified traceability" },
                { icon: "🤖", text: "AI-powered credit scoring" },
                { icon: "🌊", text: "Real-time ocean monitoring" },
                { icon: "💰", text: "Instant smart payments" }
              ].map((feature, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center space-x-4 bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 group"
                >
                  <div className="text-3xl group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <span className="text-lg text-gray-200">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
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
                  BlueChain AI
                </span>
              </h1>
              <p className="text-gray-300 text-sm">Empowering Coastal Communities</p>
            </div>

            {/* Login Card */}
            <div className="bg-gray-800/50 backdrop-blur-2xl rounded-3xl shadow-2xl border border-gray-700/50 p-8 sm:p-10">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                <p className="text-gray-400">Sign in to access your dashboard</p>
              </div>

              <form onSubmit={loginEmail} className="space-y-6">
                {/* Email Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-300">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400 group-focus-within:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-gray-900/60 border border-gray-600 text-white pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition-all duration-300 placeholder-gray-500"
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-300">
                    Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400 group-focus-within:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-gray-900/60 border border-gray-600 text-white pl-12 pr-12 py-4 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition-all duration-300 placeholder-gray-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-cyan-400 transition-colors"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center text-gray-400 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 mr-2 rounded border-gray-600 bg-gray-900/60 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0" 
                    />
                    <span className="text-sm group-hover:text-cyan-400 transition-colors">Remember me</span>
                  </label>
                  <a href="#" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors font-medium">
                    Forgot password?
                  </a>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full relative group overflow-hidden bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-500 hover:from-cyan-400 hover:via-blue-500 hover:to-cyan-400 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/40 hover:shadow-cyan-500/60 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                  style={{ backgroundSize: "200% 100%" }}
                >
                  <span className="relative z-10 flex items-center justify-center">
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing In...
                      </>
                    ) : (
                      <>
                        <span>Sign In to Dashboard</span>
                        <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </>
                    )}
                  </span>
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-gray-800/50 text-gray-400 font-medium">Or continue with</span>
                </div>
              </div>

              {/* Google Login Button */}
              <button
                onClick={loginGoogle}
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-3 bg-white hover:bg-gray-50 text-gray-900 font-semibold py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] group"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="group-hover:text-gray-700 transition-colors">Continue with Google</span>
              </button>

              {/* Sign Up Link */}
              <div className="mt-8 text-center">
                <p className="text-gray-400">
                  New to BlueChain?{" "}
                  <button
                    onClick={() => navigate("/signup")}
                    className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors inline-flex items-center group"
                  >
                    Join the Pilot Program
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </p>
              </div>
            </div>

            {/* Back to Home */}
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate("/")}
                className="text-gray-400 hover:text-cyan-400 text-sm transition-colors inline-flex items-center group"
              >
                <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Progress Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex space-x-3">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentImage(idx)}
            className={`relative overflow-hidden rounded-full transition-all duration-500 ${
              currentImage === idx
                ? "w-12 h-3 bg-gradient-to-r from-cyan-400 to-blue-500"
                : "w-3 h-3 bg-gray-500/50 hover:bg-gray-400/70"
            }`}
          >
            {currentImage === idx && (
              <div 
                className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600"
                style={{
                  animation: "progress 6s linear"
                }}
              />
            )}
          </button>
        ))}
      </div>

      <style jsx>{`
        @keyframes wave {
          0%, 100% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(-25px) translateY(-10px); }
        }

        @keyframes floatBubble {
          0% {
            transform: translateY(100vh) translateX(0) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          50% {
            transform: translateY(50vh) translateX(20px) scale(1);
            opacity: 0.6;
          }
          90% {
            opacity: 0.4;
          }
          100% {
            transform: translateY(-20vh) translateX(-20px) scale(0.8);
            opacity: 0;
          }
        }

        @keyframes kenBurns {
          0% {
            transform: scale(1);
          }
          100% {
            transform: scale(1.1);
          }
        }

        @keyframes progress {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}