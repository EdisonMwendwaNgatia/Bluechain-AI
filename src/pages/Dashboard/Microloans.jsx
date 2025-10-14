import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { ref, onValue } from "firebase/database";
import { useNavigate } from "react-router-dom";

export default function Microloans() {
  const navigate = useNavigate();
  const [creditFirms, setCreditFirms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("all");

  useEffect(() => {
    const creditFirmsRef = ref(db, "creditFirm");
    const unsubscribe = onValue(
      creditFirmsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const firmsList = Object.entries(data).map(([uid, firm]) => ({
            uid,
            ...firm,
          }));
          setCreditFirms(firmsList);
        } else {
          setCreditFirms([]);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Failed to fetch credit firms:", err);
        setError("Failed to load credit firms.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const filteredFirms = creditFirms.filter((firm) => {
    const matchesSearch =
      firm.legalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      firm.tradeName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry =
      selectedIndustry === "all" ||
      firm.industryClassification?.toLowerCase() === selectedIndustry.toLowerCase();
    return matchesSearch && matchesIndustry;
  });

  const industries = ["all", ...new Set(creditFirms.map((f) => f.industryClassification).filter(Boolean))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Animated Background Pattern */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgwLDIyNSwyNTUsMC4zKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')]"></div>
      </div>

      {/* Floating Bubbles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-cyan-400/5 border border-cyan-400/10"
            style={{
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
              left: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 20 + 15}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
              bottom: "-100px",
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative">
        <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB4PSIwIiB5PSIwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCBmaWxsPSJ1cmwoI3BhdHRlcm4pIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+')] opacity-20"></div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <button
              onClick={() => navigate("/dashboard")}
              className="mb-6 flex items-center space-x-2 text-white hover:text-blue-200 transition-colors group"
            >
              <span className="group-hover:-translate-x-1 transition-transform duration-300">←</span>
              <span>Back to Dashboard</span>
            </button>

            <div className="flex items-center space-x-4 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-green-400 rounded-2xl blur-xl opacity-60 animate-pulse"></div>
                <div className="relative w-16 h-16 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <span className="text-3xl">💰</span>
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Microloan Partners</h1>
                <p className="text-blue-100">Access financing from trusted credit firms</p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Available Firms", value: creditFirms.length, icon: "🏦", color: "from-blue-500 to-cyan-500" },
                { label: "Industries", value: industries.length - 1, icon: "🏭", color: "from-cyan-500 to-teal-500" },
                { label: "Avg. Response", value: "24hrs", icon: "⚡", color: "from-teal-500 to-green-500" },
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:border-white/40 transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-white">{stat.value}</p>
                    </div>
                    <div className={`w-14 h-14 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {stat.icon}
                    </div>
                  </div>
                </div>
              ))}
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
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filter Bar */}
        <div className="mb-8 bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 shadow-xl">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-gray-400 text-xl">🔍</span>
              </div>
              <input
                type="text"
                placeholder="Search by firm name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-600 text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 placeholder-gray-500"
              />
            </div>

            {/* Industry Filter */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-gray-400 text-xl">🏭</span>
              </div>
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-600 text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 appearance-none cursor-pointer"
              >
                {industries.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry === "all" ? "All Industries" : industry}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <span className="text-gray-400">▼</span>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 flex items-center justify-between text-sm">
            <p className="text-gray-400">
              Showing <span className="text-cyan-400 font-semibold">{filteredFirms.length}</span> of{" "}
              <span className="text-cyan-400 font-semibold">{creditFirms.length}</span> firms
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Clear search
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative w-20 h-20 mb-6">
              <div className="absolute inset-0 border-4 border-cyan-400/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-cyan-400 rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-400 text-lg">Loading microloan firms...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-2xl p-8 text-center">
            <span className="text-5xl mb-4 block">⚠️</span>
            <p className="text-red-300 text-lg">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredFirms.length === 0 && (
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-12 text-center">
            <span className="text-6xl mb-4 block">🏦</span>
            <h3 className="text-2xl font-bold text-white mb-2">No firms found</h3>
            <p className="text-gray-400 mb-6">
              {searchTerm
                ? "Try adjusting your search or filters"
                : "No microloan firms available at the moment"}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
              >
                Clear Search
              </button>
            )}
          </div>
        )}

        {/* Credit Firms Grid */}
        {!loading && !error && filteredFirms.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFirms.map((firm, idx) => (
              <div
                key={firm.uid}
                className="group bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 hover:border-cyan-500/50 transition-all duration-300 overflow-hidden hover:-translate-y-2 hover:shadow-2xl hover:shadow-cyan-500/10"
                style={{
                  animation: `fadeInUp 0.5s ease-out ${idx * 0.1}s both`,
                }}
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 p-6 border-b border-gray-700/50">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      💼
                    </div>
                    {firm.industryClassification && (
                      <span className="bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full text-xs font-semibold border border-cyan-500/30">
                        {firm.industryClassification}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-cyan-400 transition-colors">
                    {firm.legalName}
                  </h3>
                  {firm.tradeName && firm.tradeName !== firm.legalName && (
                    <p className="text-gray-400 text-sm">
                      Trading as: <span className="text-gray-300">{firm.tradeName}</span>
                    </p>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-4">
                  {/* Contact Info */}
                  {firm.contactInformation && (
                    <div className="flex items-start space-x-3">
                      <span className="text-cyan-400 text-lg mt-0.5">📞</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-400 text-xs mb-1">Contact</p>
                        <p className="text-white text-sm break-words">{firm.contactInformation}</p>
                      </div>
                    </div>
                  )}

                  {/* Address */}
                  {firm.physicalAddress && (
                    <div className="flex items-start space-x-3">
                      <span className="text-cyan-400 text-lg mt-0.5">📍</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-400 text-xs mb-1">Address</p>
                        <p className="text-white text-sm break-words">{firm.physicalAddress}</p>
                      </div>
                    </div>
                  )}

                  {/* Registration Number */}
                  {firm.registrationNumber && (
                    <div className="flex items-start space-x-3">
                      <span className="text-cyan-400 text-lg mt-0.5">🆔</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-400 text-xs mb-1">Registration No.</p>
                        <p className="text-white text-sm font-mono">{firm.registrationNumber}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="p-6 pt-0">
                  <button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:scale-[1.02] flex items-center justify-center group">
                    <span>Apply for Loan</span>
                    <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-900/20 to-cyan-900/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-8">
          <div className="flex items-start space-x-4">
            <span className="text-4xl">ℹ️</span>
            <div>
              <h3 className="text-xl font-bold text-white mb-3">How It Works</h3>
              <div className="grid md:grid-cols-3 gap-6 text-gray-300">
                <div>
                  <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center text-xl mb-3">
                    1️⃣
                  </div>
                  <h4 className="font-semibold text-white mb-2">Browse Firms</h4>
                  <p className="text-sm">Explore verified microloan partners and their offerings</p>
                </div>
                <div>
                  <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center text-xl mb-3">
                    2️⃣
                  </div>
                  <h4 className="font-semibold text-white mb-2">Apply Directly</h4>
                  <p className="text-sm">Contact firms directly with your AI credit score</p>
                </div>
                <div>
                  <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center text-xl mb-3">
                    3️⃣
                  </div>
                  <h4 className="font-semibold text-white mb-2">Get Funded</h4>
                  <p className="text-sm">Receive financing to grow your coastal business</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(100vh) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) scale(1);
            opacity: 0;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        select option {
          background-color: #1f2937;
          color: white;
        }
      `}</style>
    </div>
  );
}