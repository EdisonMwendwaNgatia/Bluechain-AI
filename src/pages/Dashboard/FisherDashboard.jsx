import React, { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { ref, get, set } from "firebase/database";

export default function FisherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [weather, setWeather] = useState(null);
  const [weatherError, setWeatherError] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const coastalLocations = [
    "Mombasa",
    "Malindi",
    "Kilifi",
    "Lamu",
    "Diani",
    "Watamu",
    "Shimoni",
    "Mtwapa",
  ];

  // load saved location once
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const snap = await get(ref(db, `users/${user.uid}/location`));
        if (snap.exists()) {
          const v = snap.val();
          if (typeof v === "string" && v.trim()) setSelectedLocation(v.trim());
          else setSelectedLocation("Mombasa");
        } else {
          setSelectedLocation("Mombasa");
        }
      } catch (err) {
        console.warn("Failed to read user location from DB", err);
        setSelectedLocation("Mombasa");
      }
    })();
  }, [user]);

  // fetch weather when selectedLocation changes
  useEffect(() => {
    if (!user || !selectedLocation) return;
    const fetchWeather = async () => {
      const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
      if (!apiKey) {
        setWeatherError("No weather API key configured. Please set VITE_WEATHER_API_KEY in .env");
        setWeather(null);
        return;
      }

      try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
          selectedLocation
        )}&units=metric&appid=${apiKey}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Weather API error ${res.status}`);
        const data = await res.json();
        setWeather({
          city: data.name,
          temp: data.main?.temp,
          condition: data.weather?.[0]?.description,
          wind: data.wind?.speed,
          humidity: data.main?.humidity,
          icon: data.weather?.[0]?.icon,
        });
        setWeatherError(null);
      } catch (err) {
        console.error("Weather fetch failed", err);
        setWeather(null);
        setWeatherError("Failed to load weather for " + selectedLocation);
      }
    };

    fetchWeather();
  }, [user, selectedLocation]);

  const handleLocationChange = async (loc) => {
    setSelectedLocation(loc);
    if (!user) return;
    try {
      await set(ref(db, `users/${user.uid}/location`), loc);
    } catch (err) {
      console.warn('Failed to save user location', err);
    }
  };

  const logout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const getWeatherIcon = (condition) => {
    if (!condition) return "🌤️";
    const lower = condition.toLowerCase();
    if (lower.includes("clear")) return "☀️";
    if (lower.includes("cloud")) return "☁️";
    if (lower.includes("rain")) return "🌧️";
    if (lower.includes("storm")) return "⛈️";
    if (lower.includes("snow")) return "❄️";
    if (lower.includes("mist") || lower.includes("fog")) return "🌫️";
    return "🌤️";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-72 bg-gray-900/95 backdrop-blur-xl border-r border-gray-800 z-50 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-500 rounded-xl blur-lg opacity-50"></div>
                <div className="relative w-10 h-10 bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <span className="text-xl">🌊</span>
                </div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                BlueChain
              </span>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {[
            { icon: "🏠", label: "Home", path: "/dashboard" },
            { icon: "👥", label: "Community", path: "/community" },
            { icon: "💰", label: "Microloans", path: "/microloans" },
            { icon: "📊", label: "My Business", path: "/business" },
            { icon: "👤", label: "My Profile", path: "/profile" },
            { icon: "⚡", label: "Advanced Features", path: "/pricing", badge: "Premium" },
            { icon: "📈", label: "Data Feed", path: "/data-feed" },
            { icon: "❄️", label: "Refrigeration", path: "/refrigeration" },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-gray-300 hover:bg-gray-800/50 hover:text-cyan-400 transition-all duration-200 group"
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-2 py-1 text-xs bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all duration-200 border border-red-500/30"
          >
            <span>🚪</span>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <main className="lg:ml-72 min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-gray-400 hover:text-white"
                >
                  <span className="text-2xl">☰</span>
                </button>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Welcome back, {user?.displayName || user?.email?.split('@')[0] || 'Fisher'}!
                  </h2>
                  <p className="text-gray-400 text-sm">Your BlueChain Dashboard</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex items-center space-x-2 bg-gray-800/50 px-4 py-2 rounded-full border border-gray-700">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                  <span className="text-green-400 text-sm font-medium">Active</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          {/*Suggestion Card - Hero */}
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-600/20 via-cyan-600/20 to-teal-600/20 rounded-3xl border border-cyan-500/30 shadow-2xl">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgwLDIyNSwyNTUsMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
            
            <div className="relative p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                    🤖
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">Top Suggestion</h3>
                    <p className="text-cyan-300 text-sm">Powered by BlueChain Intelligence</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium border border-green-500/30">
                  Active
                </span>
              </div>
              
              <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                <p className="text-gray-300 leading-relaxed mb-4">
                  Based on your recent catches, current market trends, and weather patterns, we recommend focusing on 
                  <span className="text-cyan-400 font-semibold"> Tilapia fishing </span> 
                  this week. Demand is up 35% and conditions are optimal.
                </p>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center space-x-2 bg-blue-500/10 px-4 py-2 rounded-lg border border-blue-500/30">
                    <span>📈</span>
                    <span className="text-blue-300 text-sm">High Demand</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-green-500/10 px-4 py-2 rounded-lg border border-green-500/30">
                    <span>☀️</span>
                    <span className="text-green-300 text-sm">Good Weather</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-purple-500/10 px-4 py-2 rounded-lg border border-purple-500/30">
                    <span>💰</span>
                    <span className="text-purple-300 text-sm">Premium Prices</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Main Cards */}
            <div className="lg:col-span-2 space-y-6">
              {/* Weather Card */}
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 overflow-hidden">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src="/images/oceanScenery.jpeg" 
                    alt="Ocean Weather" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"></div>
                  
                  <div className="absolute top-4 right-4">
                    <select
                      value={selectedLocation || ""}
                      onChange={(e) => handleLocationChange(e.target.value)}
                      className="bg-gray-900/80 backdrop-blur-sm border border-gray-700 text-white px-4 py-2 rounded-xl focus:outline-none focus:border-cyan-500 transition-all"
                    >
                      {coastalLocations.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-bold text-white mb-1">Weather Report</h3>
                    <p className="text-gray-300 text-sm">Live coastal conditions</p>
                  </div>
                </div>

                <div className="p-6">
                  {weatherError ? (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                      <p className="text-red-400 text-sm">{weatherError}</p>
                    </div>
                  ) : weather ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-400 text-sm">Temperature</span>
                          <span className="text-3xl">{getWeatherIcon(weather.condition)}</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{weather.temp}°C</p>
                        <p className="text-cyan-400 text-xs capitalize mt-1">{weather.condition}</p>
                      </div>
                      <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-400 text-sm">Wind Speed</span>
                          <span className="text-2xl">💨</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{weather.wind} m/s</p>
                        <p className="text-cyan-400 text-xs mt-1">Current conditions</p>
                      </div>
                      <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-400 text-sm">Location</span>
                          <span className="text-2xl">📍</span>
                        </div>
                        <p className="text-xl font-bold text-white">{weather.city}</p>
                        <p className="text-cyan-400 text-xs mt-1">Coastal region</p>
                      </div>
                      <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-400 text-sm">Humidity</span>
                          <span className="text-2xl">💧</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{weather.humidity}%</p>
                        <p className="text-cyan-400 text-xs mt-1">Moisture level</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-8">
                      <div className="flex flex-col items-center space-y-3">
                        <svg className="animate-spin h-8 w-8 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-gray-400 text-sm">Loading weather data...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Market Prices Card */}
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-2xl">
                      💰
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Fish Market Prices</h3>
                      <p className="text-gray-400 text-sm">Current rates per kg</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                    Live
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { name: "Tilapia", price: "450", trend: "+12%", color: "blue" },
                    { name: "Mackerel", price: "380", trend: "+8%", color: "cyan" },
                    { name: "Sardines", price: "220", trend: "-3%", color: "teal" },
                  ].map((fish, idx) => (
                    <div key={idx} className="bg-gray-900/50 rounded-xl p-4 border border-gray-700 hover:border-cyan-500/50 transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">{fish.name}</span>
                        <span className="text-xl">🐟</span>
                      </div>
                      <p className="text-2xl font-bold text-white mb-1">KSh {fish.price}</p>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs font-medium ${fish.trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                          {fish.trend}
                        </span>
                        <span className="text-gray-500 text-xs">vs last week</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar Cards */}
            <div className="space-y-6">
              {/* Fish Demand Card */}
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-2xl">
                    📊
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Demand Insights</h3>
                    <p className="text-gray-400 text-xs">Market trends</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { species: "Tilapia", demand: "High", percentage: 85, color: "green" },
                    { species: "Mackerel", demand: "Medium", percentage: 60, color: "yellow" },
                    { species: "Sardines", demand: "Low", percentage: 35, color: "red" },
                  ].map((item, idx) => (
                    <div key={idx} className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium text-sm">{item.species}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.color === 'green' ? 'bg-green-500/20 text-green-400' :
                          item.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {item.demand}
                        </span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            item.color === 'green' ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                            item.color === 'yellow' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                            'bg-gradient-to-r from-red-500 to-pink-600'
                          }`}
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions Card */}
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
                <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  {[
                    { icon: "💰", label: "Request Loan", path: "/microloans", color: "from-yellow-500 to-orange-500" },
                    { icon: "📈", label: "Log Catch", path: "/data-feed", color: "from-blue-500 to-cyan-500" },
                    { icon: "👥", label: "Community", path: "/community", color: "from-purple-500 to-pink-500" },
                  ].map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => navigate(action.path)}
                      className={`w-full flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-r ${action.color} hover:scale-[1.02] transition-all duration-200 shadow-lg group`}
                    >
                      <span className="text-2xl group-hover:scale-110 transition-transform">{action.icon}</span>
                      <span className="text-white font-semibold">{action.label}</span>
                      <span className="ml-auto text-white/80 group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Insights Card */}
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center text-2xl">
                💡
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">More Insights</h3>
                <p className="text-gray-400 text-sm">Analytics and data feeds</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { label: "Total Catches", value: "248 kg", change: "+15%", icon: "🐟" },
                { label: "Revenue", value: "KSh 112,400", change: "+22%", icon: "💰" },
                { label: "Credit Score", value: "785", change: "+12", icon: "⭐" },
              ].map((stat, idx) => (
                <div key={idx} className="bg-gray-900/50 rounded-xl p-5 border border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-400 text-sm">{stat.label}</span>
                    <span className="text-2xl">{stat.icon}</span>
                  </div>
                  <p className="text-2xl font-bold text-white mb-2">{stat.value}</p>
                  <span className="text-green-400 text-sm font-medium">{stat.change} this month</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        select option {
          background-color: #1f2937;
          color: white;
        }
      `}</style>
    </div>
  );
}