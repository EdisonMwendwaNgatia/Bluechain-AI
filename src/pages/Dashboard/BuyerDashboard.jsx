import React, { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { ref, set, get } from "firebase/database";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";

export default function BuyerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({ 
    company: "", 
    name: "", 
    purchases: "",
    businessType: "",
    location: "",
    monthlyVolume: ""
  });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const snap = await get(ref(db, `users/${user.uid}/buyerProfile`));
      if (snap.exists()) setProfile(snap.val());
    })();
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    if (!profile.name || !profile.purchases) {
      alert("Please fill in all required fields");
      return;
    }
    setLoading(true);
    try {
      await set(ref(db, `users/${user.uid}/buyerProfile`), profile);
      alert("Buyer profile saved successfully!");
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Failed to save buyer profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Header with Ocean Wave */}
      <div className="relative bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB4PSIwIiB5PSIwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCBmaWxsPSJ1cmwoI3BhdHRlcm4pIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+')] opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-400 rounded-2xl blur-xl opacity-60 animate-pulse"></div>
                <div className="relative w-16 h-16 bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <span className="text-3xl">🌊</span>
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Buyer Profile Setup</h1>
                <p className="text-blue-100 text-sm">Complete your profile to access buyer features</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/')}
              className="text-white hover:text-blue-200 transition-colors"
            >
              <span className="text-2xl">✕</span>
            </button>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-12">
            <path 
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
              className="fill-current text-gray-900"
            />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <span className="text-cyan-400 font-semibold text-sm">Profile Completion</span>
            <span className="text-gray-400 text-sm">Step 1 of 1</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full rounded-full transition-all duration-500 w-3/4"></div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/50 overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border-b border-gray-700 p-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                💼
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Business Information</h2>
                <p className="text-gray-400 text-sm">Tell us about your buying business</p>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8 space-y-6">
            {/* Name */}
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
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Enter your full name"
                  className="w-full bg-gray-900/50 border border-gray-600 text-white pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 placeholder-gray-500"
                  required
                />
              </div>
            </div>

            {/* Company */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Company Name <span className="text-gray-500">(Optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-lg">🏢</span>
                </div>
                <input
                  type="text"
                  value={profile.company}
                  onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                  placeholder="Your company or business name"
                  className="w-full bg-gray-900/50 border border-gray-600 text-white pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 placeholder-gray-500"
                />
              </div>
            </div>

            {/* Business Type */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Business Type <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-lg">🏪</span>
                </div>
                <select
                  value={profile.businessType}
                  onChange={(e) => setProfile({ ...profile, businessType: e.target.value })}
                  className="w-full bg-gray-900/50 border border-gray-600 text-white pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 appearance-none cursor-pointer"
                  required
                >
                  <option value="">Select business type...</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="hotel">Hotel</option>
                  <option value="retailer">Retailer</option>
                  <option value="processor">Processor/Manufacturer</option>
                  <option value="wholesaler">Wholesaler</option>
                  <option value="exporter">Exporter</option>
                  <option value="other">Other</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <span className="text-gray-400">▼</span>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Business Location
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-lg">📍</span>
                </div>
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  placeholder="City or region"
                  className="w-full bg-gray-900/50 border border-gray-600 text-white pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 placeholder-gray-500"
                />
              </div>
            </div>

            {/* What You Buy */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                What You Typically Buy <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-lg">🐟</span>
                </div>
                <select
                  value={profile.purchases}
                  onChange={(e) => setProfile({ ...profile, purchases: e.target.value })}
                  className="w-full bg-gray-900/50 border border-gray-600 text-white pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 appearance-none cursor-pointer"
                  required
                >
                  <option value="">Select products...</option>
                  <option value="tilapia">Tilapia</option>
                  <option value="mackerel">Mackerel</option>
                  <option value="sardines">Sardines</option>
                  <option value="tuna">Tuna</option>
                  <option value="prawns">Prawns/Shrimp</option>
                  <option value="crab">Crab</option>
                  <option value="lobster">Lobster</option>
                  <option value="mixed">Mixed Species</option>
                  <option value="other">Other Seafood</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <span className="text-gray-400">▼</span>
                </div>
              </div>
            </div>

            {/* Monthly Volume */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Estimated Monthly Volume
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-lg">📦</span>
                </div>
                <select
                  value={profile.monthlyVolume}
                  onChange={(e) => setProfile({ ...profile, monthlyVolume: e.target.value })}
                  className="w-full bg-gray-900/50 border border-gray-600 text-white pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 appearance-none cursor-pointer"
                >
                  <option value="">Select volume range...</option>
                  <option value="0-100">0-100 kg</option>
                  <option value="100-500">100-500 kg</option>
                  <option value="500-1000">500-1,000 kg</option>
                  <option value="1000-5000">1-5 tons</option>
                  <option value="5000+">5+ tons</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <span className="text-gray-400">▼</span>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">ℹ️</span>
                <div>
                  <h3 className="text-blue-300 font-semibold mb-1">Why do we need this?</h3>
                  <p className="text-blue-200/80 text-sm">
                    Your buyer profile helps us match you with the right suppliers and provide 
                    personalized market insights. All information is kept confidential.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              
              <button
                type="button"
                onClick={saveProfile}
                disabled={loading || !profile.name || !profile.purchases}
                className="flex-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] flex items-center justify-center min-w-[200px]"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    Save & Continue
                    <span className="ml-2">→</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Features Preview */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {[
            {
              icon: "🔍",
              title: "Find Suppliers",
              desc: "Connect with verified coastal suppliers",
              color: "from-blue-500 to-cyan-500"
            },
            {
              icon: "📊",
              title: "Track Orders",
              desc: "Real-time blockchain traceability",
              color: "from-cyan-500 to-teal-500"
            },
            {
              icon: "💎",
              title: "Quality Assured",
              desc: "verified sustainable sourcing",
              color: "from-teal-500 to-green-500"
            }
          ].map((feature, idx) => (
            <div key={idx} className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-cyan-500/50 transition-all duration-300">
              <div className={`w-14 h-14 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center text-2xl mb-4 shadow-lg`}>
                {feature.icon}
              </div>
              <h3 className="text-white font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        select option {
          background-color: #1f2937;
          color: white;
        }
      `}</style>
    </div>
  );
}