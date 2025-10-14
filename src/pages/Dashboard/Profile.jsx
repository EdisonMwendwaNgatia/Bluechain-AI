import React, { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { db } from "../../firebase";
import { ref, get, update } from "firebase/database";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    role: "",
    kycStatus: "",
  });

  // Mock transaction data
  const [transactions] = useState([
    {
      id: 1,
      date: "2025-10-05",
      type: "Sale",
      amount: 45000,
      buyer: "Ocean Fresh Ltd",
      status: "Completed",
      product: "Tilapia - 45kg"
    },
    {
      id: 2,
      date: "2025-10-03",
      type: "Sale",
      amount: 28000,
      buyer: "Coastal Market",
      status: "Completed",
      product: "Mackerel - 28kg"
    },
    {
      id: 3,
      date: "2025-10-01",
      type: "Purchase",
      amount: -15000,
      seller: "Fisherman Co-op",
      status: "Completed",
      product: "Fishing Gear"
    },
    {
      id: 4,
      date: "2025-09-28",
      type: "Sale",
      amount: 32000,
      buyer: "Seafood Palace",
      status: "Pending",
      product: "Sardines - 32kg"
    },
    {
      id: 5,
      date: "2025-09-25",
      type: "Sale",
      amount: 18000,
      buyer: "Local Restaurant",
      status: "Completed",
      product: "Crabs - 18kg"
    }
  ]);

  // Mock chart data
  const [salesData] = useState([
    { month: "Jun", sales: 120000 },
    { month: "Jul", sales: 145000 },
    { month: "Aug", sales: 98000 },
    { month: "Sep", sales: 165000 },
    { month: "Oct", sales: 75000 }
  ]);

  const [catchData] = useState([
    { species: "Tilapia", quantity: 45, value: 45000, icon: "🐟" },
    { species: "Mackerel", quantity: 28, value: 28000, icon: "🐠" },
    { species: "Sardines", quantity: 32, value: 32000, icon: "🐟" },
    { species: "Crabs", quantity: 18, value: 18000, icon: "🦀" },
    { species: "Lobster", quantity: 12, value: 36000, icon: "🦞" }
  ]);

  useEffect(() => {
    if (authLoading) return;

    if (!user?.uid) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const snap = await get(ref(db, `users/${user.uid}`));
        if (snap.exists()) {
          const data = snap.val() || {};
          setProfile({
            fullName: data.fullName || user.displayName || "",
            email: data.email || user.email || "",
            phone: data.phone || user.phoneNumber || "",
            location: data.location || "",
            role: data.role || "",
            kycStatus: data.kycStatus || "",
          });
        } else {
          setProfile({
            fullName: user.displayName || "",
            email: user.email || "",
            phone: user.phoneNumber || "",
            location: "",
            role: "",
            kycStatus: "",
          });
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
        setError("Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    })();
  }, [user, authLoading]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.uid) return;

    setLoading(true);
    setError(null);
    try {
      await update(ref(db, `users/${user.uid}`), {
        fullName: profile.fullName,
        email: profile.email,
        phone: profile.phone,
        location: profile.location,
      });
      alert("Profile updated successfully");
    } catch (err) {
      console.error("Failed to update profile", err);
      setError("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const totalSales = transactions
    .filter(t => t.type === "Sale" && t.status === "Completed")
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingAmount = transactions
    .filter(t => t.status === "Pending")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalTransactions = transactions.length;

  const avgSale = totalSales / (transactions.filter(t => t.type === "Sale").length || 1);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cyan-400 text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user?.uid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-xl">No user session detected.</p>
          <button onClick={() => navigate('/login')} className="mt-4 px-6 py-2 bg-cyan-500 rounded-lg hover:bg-cyan-400 transition-colors">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Ocean Wave Header */}
      <div className="relative bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB4PSIwIiB5PSIwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCBmaWxsPSJ1cmwoI3BhdHRlcm4pIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+')] opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/dashboard')}
                className="text-white hover:text-blue-200 transition-colors"
              >
                <span className="text-2xl">←</span>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white">My Profile & Business</h1>
                <p className="text-blue-100 text-sm">Manage your account and track performance</p>
              </div>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center shadow-2xl">
              <span className="text-3xl">👤</span>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 p-2 flex space-x-2">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === "profile"
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30"
                : "text-gray-400 hover:text-white hover:bg-gray-700/50"
            }`}
          >
            <span className="mr-2">👤</span>
            Personal Information
          </button>
          <button
            onClick={() => setActiveTab("transactions")}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === "transactions"
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30"
                : "text-gray-400 hover:text-white hover:bg-gray-700/50"
            }`}
          >
            <span className="mr-2">📊</span>
            Transactions & Reports
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-300">
            <span className="font-semibold">Error:</span> {error}
          </div>
        )}

        {activeTab === "profile" ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information Card */}
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/50 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border-b border-gray-700 p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                    📋
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Personal Information</h2>
                    <p className="text-gray-400 text-sm">Your account details and contact information</p>
                  </div>
                </div>
              </div>

              <div className="p-8 grid md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="group">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-400 text-lg">👤</span>
                    </div>
                    <input
                      type="text"
                      name="fullName"
                      value={profile.fullName}
                      readOnly
                      className="w-full bg-gray-900/50 border border-gray-600 text-gray-400 pl-12 pr-4 py-4 rounded-xl cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Read-only field</p>
                </div>

                {/* Email */}
                <div className="group">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-400 text-lg">📧</span>
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      readOnly
                      className="w-full bg-gray-900/50 border border-gray-600 text-gray-400 pl-12 pr-4 py-4 rounded-xl cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Read-only field</p>
                </div>

                {/* Phone */}
                <div className="group">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-400 text-lg">📱</span>
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={profile.phone}
                      onChange={handleChange}
                      placeholder="e.g., +254 700 000 000"
                      className="w-full bg-gray-900/50 border border-gray-600 text-white pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 placeholder-gray-500"
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="group">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Location
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-400 text-lg">📍</span>
                    </div>
                    <input
                      type="text"
                      name="location"
                      value={profile.location}
                      onChange={handleChange}
                      placeholder="e.g., Mombasa"
                      className="w-full bg-gray-900/50 border border-gray-600 text-white pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 placeholder-gray-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Account Status Card */}
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/50 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-b border-gray-700 p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                    🔐
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Account Status</h2>
                    <p className="text-gray-400 text-sm">Your role and verification status</p>
                  </div>
                </div>
              </div>

              <div className="p-8 grid md:grid-cols-2 gap-6">
                {/* Role */}
                <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm font-medium">Role</span>
                    <span className="text-2xl">👔</span>
                  </div>
                  <p className="text-2xl font-bold text-white capitalize">
                    {profile.role || "Not Set"}
                  </p>
                </div>

                {/* KYC Status */}
                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm font-medium">KYC Status</span>
                    <span className="text-2xl">✓</span>
                  </div>
                  <p className="text-2xl font-bold text-white capitalize">
                    {profile.kycStatus || "Not Submitted"}
                  </p>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 px-12 rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] flex items-center"
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
                    Update Profile
                    <span className="ml-2">→</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "Total Sales", value: `KSh ${totalSales.toLocaleString()}`, icon: "💰", color: "from-green-500 to-emerald-500", bg: "from-green-500/10 to-emerald-500/10" },
                { title: "Pending", value: `KSh ${pendingAmount.toLocaleString()}`, icon: "⏳", color: "from-yellow-500 to-orange-500", bg: "from-yellow-500/10 to-orange-500/10" },
                { title: "Transactions", value: totalTransactions, icon: "📝", color: "from-blue-500 to-cyan-500", bg: "from-blue-500/10 to-cyan-500/10" },
                { title: "Avg. Sale", value: `KSh ${Math.round(avgSale).toLocaleString()}`, icon: "📊", color: "from-purple-500 to-pink-500", bg: "from-purple-500/10 to-pink-500/10" }
              ].map((stat, idx) => (
                <div key={idx} className={`bg-gradient-to-br ${stat.bg} backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6 hover:scale-105 transition-transform duration-300`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-2xl shadow-lg`}>
                      {stat.icon}
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Sales Trend Chart */}
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/50 overflow-hidden">
                <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border-b border-gray-700 p-6">
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <span className="mr-3 text-2xl">📈</span>
                    Monthly Sales Trend
                  </h3>
                </div>
                <div className="p-8 space-y-4">
                  {salesData.map((item) => {
                    const maxSales = Math.max(...salesData.map(d => d.sales));
                    const percentage = (item.sales / maxSales) * 100;
                    return (
                      <div key={item.month} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400 font-medium">{item.month}</span>
                          <span className="text-cyan-400 font-bold">KSh {(item.sales / 1000).toFixed(0)}K</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full rounded-full transition-all duration-1000 ease-out shadow-lg shadow-cyan-500/50"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Catch Distribution */}
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/50 overflow-hidden">
                <div className="bg-gradient-to-r from-teal-600/20 to-green-600/20 border-b border-gray-700 p-6">
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <span className="mr-3 text-2xl">🐟</span>
                    Catch Distribution
                  </h3>
                </div>
                <div className="p-8 space-y-4">
                  {catchData.map((item) => (
                    <div key={item.species} className="bg-gray-900/30 rounded-xl p-4 border border-gray-700/50 hover:border-cyan-500/50 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-3xl">{item.icon}</span>
                          <span className="text-white font-semibold">{item.species}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-cyan-400 font-bold">{item.quantity}kg</p>
                          <p className="text-gray-400 text-sm">KSh {item.value.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/50 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-gray-700 p-6">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <span className="mr-3 text-2xl">💳</span>
                  Recent Transactions
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-900/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Counterparty</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/50">
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-700/20 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {new Date(transaction.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            transaction.type === "Sale" 
                              ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                              : "bg-red-500/20 text-red-400 border border-red-500/30"
                          }`}>
                            {transaction.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">{transaction.product}</td>
                        <td className="px-6 py-4 text-sm text-gray-300">{transaction.buyer || transaction.seller}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className={`font-bold ${transaction.amount > 0 ? "text-green-400" : "text-red-400"}`}>
                            KSh {Math.abs(transaction.amount).toLocaleString()}
                          </span>
                        </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            transaction.status === "Completed" 
                              ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                              : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                          }`}>
                            {transaction.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Reports Section */}
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/50 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 border-b border-gray-700 p-6">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <span className="mr-3 text-2xl">📋</span>
                  Business Reports
                </h3>
              </div>
              <div className="p-8 grid md:grid-cols-3 gap-6">
                {[
                  {
                    title: "Monthly Sales Report",
                    description: "Download PDF",
                    icon: "📄",
                    color: "from-blue-500 to-cyan-500",
                    bg: "from-blue-500/10 to-cyan-500/10"
                  },
                  {
                    title: "Tax Summary",
                    description: "View Details",
                    icon: "🧾",
                    color: "from-green-500 to-emerald-500",
                    bg: "from-green-500/10 to-emerald-500/10"
                  },
                  {
                    title: "Inventory Report",
                    description: "Generate",
                    icon: "📦",
                    color: "from-purple-500 to-pink-500",
                    bg: "from-purple-500/10 to-pink-500/10"
                  }
                ].map((report, idx) => (
                  <button
                    key={idx}
                    className={`bg-gradient-to-br ${report.bg} backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6 text-left hover:scale-105 transition-all duration-300 hover:border-cyan-500/50 group`}
                  >
                    <div className={`w-16 h-16 bg-gradient-to-br ${report.color} rounded-xl flex items-center justify-center text-2xl shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      {report.icon}
                    </div>
                    <h4 className="text-lg font-bold text-white mb-2">{report.title}</h4>
                    <p className="text-gray-400 text-sm">{report.description}</p>
                    <div className="mt-4 flex items-center text-cyan-400 text-sm font-semibold">
                      View Report
                      <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Export Options */}
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/50 overflow-hidden">
              <div className="p-8">
                <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                  <div>
                    <h4 className="text-lg font-bold text-white mb-2">Export All Data</h4>
                    <p className="text-gray-400 text-sm">Download comprehensive reports in multiple formats</p>
                  </div>
                  <div className="flex space-x-4">
                    <button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:scale-105 flex items-center">
                      <span className="mr-2">📥</span>
                      Export as PDF
                    </button>
                    <button className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 flex items-center">
                      <span className="mr-2">📊</span>
                      Export as Excel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Wave */}
      <div className="relative mt-16">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-12">
          <path 
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
            className="fill-current text-gray-800"
            opacity="0.7"
          />
        </svg>
      </div>
    </div>
  );
}