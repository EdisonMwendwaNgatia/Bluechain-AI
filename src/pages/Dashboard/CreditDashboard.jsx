import React, { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { ref, set, get } from "firebase/database";
import { db } from "../../firebase";

export default function CreditDashboard() {
  const { user } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'firms'
  const [creditFirmData, setCreditFirmData] = useState({
    legalName: "",
    tradeName: "",
    registrationNumber: "",
    physicalAddress: "",
    contactInformation: "",
    dateOfIncorporation: "",
    legalForm: "",
    industryClassification: "",
    directorsOwnersInformation: "",
    licensingRegulatoryStatus: "",
  });
  const [creditFirmLoading, setCreditFirmLoading] = useState(false);
  const [otherCreditFirms, setOtherCreditFirms] = useState([]);
  const [otherFirmsLoading, setOtherFirmsLoading] = useState(false);
  const [hasExistingProfile, setHasExistingProfile] = useState(false);

  // Background images for the header
  const headerImages = [
    "/assets/images/oceanScenery.jpeg",
    "/assets/images/oceanscenery2.jpeg",
    "/assets/images/fishermenGrowth.jpeg",
    "/assets/images/financialGrowth.jpeg"
  ];

  // Rotate background images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % headerImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!user) return;
    
    (async () => {
      const creditFirmSnap = await get(ref(db, `creditFirm/${user.uid}`));
      if (creditFirmSnap.exists()) {
        setCreditFirmData(creditFirmSnap.val());
        setHasExistingProfile(true);
      }
    })();

    fetchOtherCreditFirms();
  }, [user]);

  const handleCreditFirmInputChange = (e) => {
    const { name, value } = e.target;
    setCreditFirmData((prev) => ({ ...prev, [name]: value }));
  };

  const fetchOtherCreditFirms = async () => {
    setOtherFirmsLoading(true);
    try {
      const snap = await get(ref(db, 'creditFirm'));
      if (snap.exists()) {
        const allFirms = snap.val();
        const firms = Object.entries(allFirms)
          .map(([uid, data]) => ({ uid, ...data }))
          .filter(firm => !hasExistingProfile || firm.uid !== user?.uid);
        setOtherCreditFirms(firms);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setOtherFirmsLoading(false);
    }
  };

  const saveCreditFirmProfile = async () => {
    if (!user) return;
    
    // Basic validation
    if (!creditFirmData.legalName || !creditFirmData.contactInformation) {
      alert("Please fill in at least Legal Name and Contact Information");
      return;
    }

    setCreditFirmLoading(true);
    try {
      await set(ref(db, `creditFirm/${user.uid}`), creditFirmData);
      alert("Credit firm profile saved successfully!");
      setHasExistingProfile(true);
      await fetchOtherCreditFirms();
    } catch (err) {
      console.error(err);
      alert('Failed to save credit firm profile');
    } finally {
      setCreditFirmLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Animated Header with Ocean Imagery */}
      <div className="relative overflow-hidden">
        {/* Background Image Slideshow */}
        <div className="absolute inset-0 h-80">
          {headerImages.map((img, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-2000 ${
                currentImageIndex === idx ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={img}
                alt={`Credit scene ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-cyan-900/70 to-teal-900/80"></div>
            </div>
          ))}
        </div>

        {/* Wave Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB4PSIwIiB5PSIwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNwYXR0ZXJuKSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIvPjwvc3ZnPg==')] opacity-20"></div>

        {/* Header Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-400 rounded-2xl blur-xl opacity-60 animate-pulse"></div>
              <div className="relative w-20 h-20 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <span className="text-4xl">💰</span>
              </div>
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Credit Dashboard</h1>
              <p className="text-cyan-200 text-lg">Manage your credit firm and discover partners</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {[
              { icon: "🏢", label: "Credit Firms", value: otherCreditFirms.length + (hasExistingProfile ? 1 : 0), color: "from-blue-500 to-cyan-500" },
              { icon: "✓", label: "Your Profile", value: hasExistingProfile ? "Active" : "Pending", color: "from-green-500 to-emerald-500" },
              { icon: "🤝", label: "Network", value: `${otherCreditFirms.length} Partners`, color: "from-purple-500 to-pink-500" }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-cyan-400/50 transition-all duration-300 hover:scale-105">
                <div className="flex items-center space-x-4">
                  <div className={`w-14 h-14 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center text-2xl shadow-lg`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm">{stat.label}</p>
                    <p className="text-white text-2xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-16">
            <path 
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
              className="fill-current text-gray-900"
            />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-8 bg-gray-800/50 backdrop-blur-sm rounded-2xl p-2 border border-gray-700">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'profile'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <span className="flex items-center justify-center space-x-2">
              <span>📝</span>
              <span>Your Profile</span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab('firms')}
            className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'firms'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <span className="flex items-center justify-center space-x-2">
              <span>🏢</span>
              <span>Credit Firms Network</span>
            </span>
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-gray-800/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/50 overflow-hidden">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-b border-gray-700 p-8">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                  💼
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">Credit Firm Information</h2>
                  <p className="text-gray-400">Provide comprehensive details about your credit firm</p>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Legal Name */}
                <div className="group">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Legal Name <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-400 text-lg">🏛️</span>
                    </div>
                    <input
                      type="text"
                      name="legalName"
                      value={creditFirmData.legalName}
                      onChange={handleCreditFirmInputChange}
                      placeholder="e.g., ABC Lending Corporation"
                      className="w-full bg-gray-900/50 border border-gray-600 text-white pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 placeholder-gray-500"
                    />
                  </div>
                </div>

                {/* Trade Name */}
                <div className="group">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Trade Name <span className="text-gray-500">(Optional)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-400 text-lg">🏪</span>
                    </div>
                    <input
                      type="text"
                      name="tradeName"
                      value={creditFirmData.tradeName}
                      onChange={handleCreditFirmInputChange}
                      placeholder="e.g., FastCash Loans"
                      className="w-full bg-gray-900/50 border border-gray-600 text-white pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 placeholder-gray-500"
                    />
                  </div>
                </div>

                {/* Registration Number */}
                <div className="group">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Registration Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-400 text-lg">🔢</span>
                    </div>
                    <input
                      type="text"
                      name="registrationNumber"
                      value={creditFirmData.registrationNumber}
                      onChange={handleCreditFirmInputChange}
                      placeholder="e.g., CR-2024-123456"
                      className="w-full bg-gray-900/50 border border-gray-600 text-white pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 placeholder-gray-500"
                    />
                  </div>
                </div>

                {/* Date of Incorporation */}
                <div className="group">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date of Incorporation
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-400 text-lg">📅</span>
                    </div>
                    <input
                      type="date"
                      name="dateOfIncorporation"
                      value={creditFirmData.dateOfIncorporation}
                      onChange={handleCreditFirmInputChange}
                      className="w-full bg-gray-900/50 border border-gray-600 text-white pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Physical Address */}
                <div className="group md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Physical Address
                  </label>
                  <div className="relative">
                    <div className="absolute top-4 left-0 pl-4 flex items-start pointer-events-none">
                      <span className="text-gray-400 text-lg">📍</span>
                    </div>
                    <input
                      type="text"
                      name="physicalAddress"
                      value={creditFirmData.physicalAddress}
                      onChange={handleCreditFirmInputChange}
                      placeholder="e.g., 123 Main Street, Nairobi, Kenya"
                      className="w-full bg-gray-900/50 border border-gray-600 text-white pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 placeholder-gray-500"
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="group">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Contact Information <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-400 text-lg">📞</span>
                    </div>
                    <input
                      type="text"
                      name="contactInformation"
                      value={creditFirmData.contactInformation}
                      onChange={handleCreditFirmInputChange}
                      placeholder="e.g., +254 700 000 000, info@firm.com"
                      className="w-full bg-gray-900/50 border border-gray-600 text-white pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 placeholder-gray-500"
                    />
                  </div>
                </div>

                {/* Legal Form */}
                <div className="group">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Legal Form
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-400 text-lg">⚖️</span>
                    </div>
                    <input
                      type="text"
                      name="legalForm"
                      value={creditFirmData.legalForm}
                      onChange={handleCreditFirmInputChange}
                      placeholder="e.g., Limited Company, LLC"
                      className="w-full bg-gray-900/50 border border-gray-600 text-white pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 placeholder-gray-500"
                    />
                  </div>
                </div>

                {/* Industry Classification */}
                <div className="group md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Industry Classification
                  </label>
                  <div className="relative">
                    <div className="absolute top-4 left-0 pl-4 flex items-start pointer-events-none">
                      <span className="text-gray-400 text-lg">🏭</span>
                    </div>
                    <input
                      type="text"
                      name="industryClassification"
                      value={creditFirmData.industryClassification}
                      onChange={handleCreditFirmInputChange}
                      placeholder="e.g., 522291 (Consumer Lending)"
                      className="w-full bg-gray-900/50 border border-gray-600 text-white pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 placeholder-gray-500"
                    />
                  </div>
                </div>

                {/* Directors/Owners Information */}
                <div className="group md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Directors/Owners Information
                  </label>
                  <div className="relative">
                    <div className="absolute top-4 left-0 pl-4 flex items-start pointer-events-none">
                      <span className="text-gray-400 text-lg">👥</span>
                    </div>
                    <textarea
                      name="directorsOwnersInformation"
                      value={creditFirmData.directorsOwnersInformation}
                      onChange={handleCreditFirmInputChange}
                      placeholder="e.g., John Doe (CEO), Jane Smith (CFO), Board Members..."
                      rows="4"
                      className="w-full bg-gray-900/50 border border-gray-600 text-white pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 placeholder-gray-500 resize-none"
                    ></textarea>
                  </div>
                </div>

                {/* Licensing and Regulatory Status */}
                <div className="group md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Licensing and Regulatory Status
                  </label>
                  <div className="relative">
                    <div className="absolute top-4 left-0 pl-4 flex items-start pointer-events-none">
                      <span className="text-gray-400 text-lg">📜</span>
                    </div>
                    <textarea
                      name="licensingRegulatoryStatus"
                      value={creditFirmData.licensingRegulatoryStatus}
                      onChange={handleCreditFirmInputChange}
                      placeholder="e.g., Licensed by Central Bank of Kenya, Regulated by Financial Regulatory Authority..."
                      rows="4"
                      className="w-full bg-gray-900/50 border border-gray-600 text-white pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 placeholder-gray-500 resize-none"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="mt-8 bg-blue-900/20 border border-blue-500/30 rounded-xl p-6">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">ℹ️</span>
                  <div>
                    <h3 className="text-blue-300 font-semibold mb-1">Data Privacy & Security</h3>
                    <p className="text-blue-200/80 text-sm">
                      All information is encrypted and stored securely. Your credit firm details are shared only within the BlueChain AI network to facilitate partnerships and lending opportunities.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-8">
                <button
                  onClick={saveCreditFirmProfile}
                  disabled={creditFirmLoading}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold py-5 rounded-xl transition-all duration-300 shadow-lg shadow-green-500/30 hover:shadow-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] flex items-center justify-center text-lg"
                >
                  {creditFirmLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving Profile...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">💾</span>
                      Save Credit Firm Profile
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Credit Firms Network Tab */}
        {activeTab === 'firms' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Credit Firms Network</h2>
                <p className="text-gray-400">Connect with other credit firms in the BlueChain AI ecosystem</p>
              </div>
              <button
                onClick={fetchOtherCreditFirms}
                disabled={otherFirmsLoading}
                className="bg-cyan-500 hover:bg-cyan-400 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:scale-105 disabled:opacity-50 flex items-center space-x-2"
              >
                <span>🔄</span>
                <span>{otherFirmsLoading ? "Refreshing..." : "Refresh"}</span>
              </button>
            </div>

            {otherFirmsLoading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-500"></div>
                <p className="text-gray-400 mt-4">Loading credit firms...</p>
              </div>
            ) : otherCreditFirms.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherCreditFirms.map((firm, idx) => (
                  <div 
                    key={firm.uid} 
                    className="group bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 hover:border-cyan-500/50 transition-all duration-300 overflow-hidden hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/20"
                    style={{
                      animation: `fadeInUp 0.5s ease-out ${idx * 0.1}s both`
                    }}
                  >
                    {/* Card Header */}
                    <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 p-6 border-b border-gray-700">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                          🏢
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-white truncate">{firm.legalName || 'Unnamed Firm'}</h3>
                          {firm.tradeName && (
                            <p className="text-cyan-400 text-sm truncate">({firm.tradeName})</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 space-y-3">
                      {firm.registrationNumber && (
                        <div className="flex items-start space-x-3">
                          <span className="text-gray-400 text-lg">🔢</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-500 text-xs">Registration</p>
                            <p className="text-white text-sm truncate">{firm.registrationNumber}</p>
                          </div>
                        </div>
                      )}

                      {firm.contactInformation && (
                        <div className="flex items-start space-x-3">
                          <span className="text-gray-400 text-lg">📞</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-500 text-xs">Contact</p>
                            <p className="text-white text-sm truncate">{firm.contactInformation}</p>
                          </div>
                        </div>
                      )}

                      {firm.physicalAddress && (
                        <div className="flex items-start space-x-3">
                          <span className="text-gray-400 text-lg">📍</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-500 text-xs">Address</p>
                            <p className="text-white text-sm truncate">{firm.physicalAddress}</p>
                          </div>
                        </div>
                      )}

                      {firm.dateOfIncorporation && (
                        <div className="flex items-start space-x-3">
                          <span className="text-gray-400 text-lg">📅</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-500 text-xs">Incorporated</p>
                            <p className="text-white text-sm">{new Date(firm.dateOfIncorporation).toLocaleDateString()}</p>
                          </div>
                        </div>
                      )}

                      {firm.legalForm && (
                        <div className="flex items-start space-x-3">
                          <span className="text-gray-400 text-lg">⚖️</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-500 text-xs">Legal Form</p>
                            <p className="text-white text-sm truncate">{firm.legalForm}</p>
                          </div>
                        </div>
                      )}

                      {firm.industryClassification && (
                        <div className="flex items-start space-x-3">
                          <span className="text-gray-400 text-lg">🏭</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-500 text-xs">Industry</p>
                            <p className="text-white text-sm truncate">{firm.industryClassification}</p>
                          </div>
                        </div>
                      )}

                      {firm.directorsOwnersInformation && (
                        <div className="flex items-start space-x-3">
                          <span className="text-gray-400 text-lg">👥</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-500 text-xs">Leadership</p>
                            <p className="text-white text-sm line-clamp-2">{firm.directorsOwnersInformation}</p>
                          </div>
                        </div>
                      )}

                      {firm.licensingRegulatoryStatus && (
                        <div className="flex items-start space-x-3">
                          <span className="text-gray-400 text-lg">📜</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-500 text-xs">Regulatory Status</p>
                            <p className="text-white text-sm line-clamp-2">{firm.licensingRegulatoryStatus}</p>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="pt-4 border-t border-gray-700">
                        <div className="flex space-x-2">
                          <button className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-white py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-300 hover:scale-105">
                            Connect
                          </button>
                          <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-300 hover:scale-105">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-gray-800/30 rounded-3xl border border-gray-700/50">
                <div className="w-24 h-24 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">🏢</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">No Credit Firms Found</h3>
                <p className="text-gray-400 max-w-md mx-auto mb-6">
                  {hasExistingProfile 
                    ? "No other credit firms are currently registered in the network. Be the first to connect!"
                    : "Save your credit firm profile first to see other registered firms in the network."
                  }
                </p>
                {!hasExistingProfile && (
                  <button
                    onClick={() => setActiveTab('profile')}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:scale-105"
                  >
                    Create Your Profile
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add CSS animations */}
      <style jsx>{`
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
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}