import React, { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { ref, onValue, off, get } from "firebase/database";

export default function Business() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [userPhones, setUserPhones] = useState({});
  const [loadingListings, setLoadingListings] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const logout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  // Fetch user phone numbers
  const fetchUserPhones = async (userIds) => {
    const phones = {};
    for (const userId of userIds) {
      try {
        const userRef = ref(db, `users/${userId}`);
        const snapshot = await get(userRef);
        const userData = snapshot.val();
        if (userData && userData.phone) {
          phones[userId] = userData.phone;
        }
      } catch (error) {
        console.error(`Error fetching phone for user ${userId}:`, error);
      }
    }
    return phones;
  };

  // Create WhatsApp URL
  const createWhatsAppUrl = (phoneNumber, catchTitle, fisherName) => {
    const cleanPhone = phoneNumber.replace(/[^0-9+]/g, "");
    const message = `Hi ${fisherName}! I'm interested in your ${catchTitle} listed on BlueChain AI Marketplace. Could you provide more details?`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  useEffect(() => {
    const catchesRef = ref(db, 'catches');
    setLoadingListings(true);
    
    const unsubscribe = onValue(
      catchesRef,
      async (snapshot) => {
        const val = snapshot.val();
        if (!val) {
          setListings([]);
          setError(null);
          setLoadingListings(false);
          return;
        }

        const catchesArray = Object.entries(val).map(([key, catchData]) => {
          const isAvailable = catchData.catchStatus !== 'sold';
          return {
            id: key,
            title: catchData.species || 'Fish Catch',
            price: catchData.pricePerKg ? `KSh ${catchData.pricePerKg}/kg` : 'Price on request',
            location: catchData.location || 'Location not specified',
            quantity: catchData.volume || null,
            fisherName: catchData.fisherName || 'Unknown Fisher',
            fisherEmail: catchData.fisherEmail || '',
            fisherId: catchData.fisherId || '',
            catchType: catchData.catchType || '',
            storageMethod: catchData.storageMethod || '',
            catchDate: catchData.catchDate || '',
            catchStatus: catchData.catchStatus || 'not_sold',
            pricePerKg: catchData.pricePerKg || '',
            buyer: catchData.buyer || '',
            notes: catchData.notes || '',
            createdAt: catchData.createdAt || '',
            available: isAvailable
          };
        });

        const uniqueFisherIds = [...new Set(catchesArray.map(item => item.fisherId).filter(Boolean))];
        if (uniqueFisherIds.length > 0) {
          const phones = await fetchUserPhones(uniqueFisherIds);
          setUserPhones(phones);
        }

        setListings(catchesArray);
        setError(null);
        setLoadingListings(false);
      },
      (err) => {
        console.error('Failed to load catches', err);
        setError('Failed to load marketplace listings');
        setLoadingListings(false);
      }
    );

    return () => {
      try {
        off(catchesRef, 'value', unsubscribe);
      } catch (error) {
        console.error('Error unsubscribing from catches listener:', error);
      }
    };
  }, []);

  const handleContactFisher = (listing) => {
    const fisherId = listing.fisherId;
    const phoneNumber = userPhones[fisherId];
    
    if (phoneNumber) {
      const whatsappUrl = createWhatsAppUrl(phoneNumber, listing.title, listing.fisherName);
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    } else {
      alert(`No phone number available for ${listing.fisherName}. You can try contacting them via email: ${listing.fisherEmail}`);
    }
  };

  // Filter listings
  const filteredListings = listings.filter(item => {
    const matchesFilter = filterType === 'all' || item.catchType === filterType || 
                         (filterType === 'available' && item.available) ||
                         (filterType === 'sold' && !item.available);
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.fisherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Mobile Menu Toggle */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-gray-800 text-white p-3 rounded-xl shadow-lg"
      >
        <span className="text-2xl">{sidebarOpen ? '✕' : '☰'}</span>
      </button>

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full bg-gray-800/95 backdrop-blur-xl border-r border-gray-700 w-64 transform transition-transform duration-300 z-40 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500 rounded-xl blur-lg opacity-60"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🌊</span>
              </div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              BlueChain AI
            </span>
          </div>

          <nav className="space-y-2">
            {[
              { icon: '🏠', label: 'Home', path: '/dashboard' },
              { icon: '👥', label: 'Community', path: '/community' },
              { icon: '💰', label: 'Microloans', path: '/microloans' },
              { icon: '🏪', label: 'My Business', path: '/business', active: true },
              { icon: '👤', label: 'My Profile', path: '/profile' },
              { icon: '⚡', label: 'Advanced AI', path: '/pricing' },
              { icon: '📊', label: 'Data Feed', path: '/data-feed' },
              { icon: '💳', label: 'Credit Dashboard', path: '/credit-dashboard' }
            ].map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  item.active 
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30' 
                    : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-700">
          <button
            onClick={logout}
            className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 px-4 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        {/* Header with Ocean Wave */}
        <div className="relative bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB4PSIwIiB5PSIwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCBmaWxsPSJ1cmwoI3BhdHRlcm4pIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+')] opacity-20"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">🏪 Marketplace</h1>
                <p className="text-blue-100">Browse fresh catches from local coastal fishers</p>
              </div>
              <div className="hidden md:block">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/30">
                  <p className="text-white text-sm">Welcome back,</p>
                  <p className="text-white font-semibold">{user?.fullName || user?.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Wave Divider */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-12"></svg>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700 mb-6">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-xl">🔍</span>
                </div>
                <input
                  type="text"
                  placeholder="Search by species, fisher, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-900/50 border border-gray-600 text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 placeholder-gray-500"
                />
              </div>

              {/* Filter */}
              <div className="flex gap-2 flex-wrap">
                {[
                  { label: 'All', value: 'all', icon: '🌊' },
                  { label: 'Available', value: 'available', icon: '✓' },
                  { label: 'Fish', value: 'fish', icon: '🐟' },
                  { label: 'Sold', value: 'sold', icon: '💰' }
                ].map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setFilterType(filter.value)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                      filterType === filter.value
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <span className="mr-2">{filter.icon}</span>
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-700">
              <div className="text-center">
                <p className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  {filteredListings.length}
                </p>
                <p className="text-gray-400 text-sm mt-1">Total Catches</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
                  {filteredListings.filter(l => l.available).length}
                </p>
                <p className="text-gray-400 text-sm mt-1">Available</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {Object.keys(userPhones).length}
                </p>
                <p className="text-gray-400 text-sm mt-1">Active Fishers</p>
              </div>
            </div>
          </div>

          {/* Listings Grid */}
          {loadingListings ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">Loading marketplace...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center">
              <span className="text-5xl mb-4 block">⚠️</span>
              <p className="text-red-400 font-semibold">{error}</p>
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-12 text-center border border-gray-700">
              <span className="text-6xl mb-4 block">🐟</span>
              <h3 className="text-2xl font-bold text-white mb-2">No Catches Found</h3>
              <p className="text-gray-400">
                {searchQuery || filterType !== 'all' 
                  ? 'Try adjusting your filters or search query' 
                  : 'When fishers log their catches, they will appear here'}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((item) => {
                const hasPhone = userPhones[item.fisherId];
                
                return (
                  <div 
                    key={item.id} 
                    className="group bg-gray-800/50 backdrop-blur-xl rounded-2xl overflow-hidden border border-gray-700 hover:border-cyan-500/50 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/20"
                  >
                    {/* Card Header with Image Placeholder */}
                    <div className="relative h-48 bg-gradient-to-br from-blue-600 to-cyan-600 overflow-hidden">
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB4PSIwIiB5PSIwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCBmaWxsPSJ1cmwoI3BhdHRlcm4pIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+')] opacity-30"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-7xl opacity-70">🐟</span>
                      </div>
                      <div className="absolute top-4 right-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          item.available 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-700 text-gray-300'
                        }`}>
                          {item.available ? '✓ Available' : '💰 Sold'}
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                        {item.title}
                      </h3>
                      
                      <p className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-4">
                        {item.price}
                      </p>

                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex items-center text-gray-400">
                          <span className="mr-2">📍</span>
                          <span>{item.location}</span>
                        </div>
                        <div className="flex items-center text-gray-400">
                          <span className="mr-2">👤</span>
                          <span>{item.fisherName}</span>
                        </div>
                        {item.quantity && (
                          <div className="flex items-center text-gray-400">
                            <span className="mr-2">⚖️</span>
                            <span>{item.quantity}</span>
                          </div>
                        )}
                        {item.storageMethod && (
                          <div className="flex items-center text-gray-400">
                            <span className="mr-2">❄️</span>
                            <span>{item.storageMethod}</span>
                          </div>
                        )}
                        {item.catchDate && (
                          <div className="flex items-center text-gray-400">
                            <span className="mr-2">📅</span>
                            <span>{new Date(item.catchDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      {item.notes && (
                        <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-3 mb-4">
                          <p className="text-blue-300 text-sm">{item.notes}</p>
                        </div>
                      )}

                      <button
                        onClick={() => handleContactFisher(item)}
                        disabled={!hasPhone}
                        className={`w-full py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center space-x-2 ${
                          hasPhone
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:scale-105'
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <span className="text-xl">📱</span>
                        <span>{hasPhone ? 'Contact via WhatsApp' : 'No Phone Available'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}