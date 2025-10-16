import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

export default function RefrigerationServices() {
  const { user } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [userLocation, setUserLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  // Background images for the header
  const headerImages = [
    "/assets/images/oceanScenery.jpeg",
    "/assets/images/oceanscenery2.jpeg",
    "/assets/images/fishermenGrowth.jpeg",
    "/assets/images/financialGrowth.jpeg"
  ];

  // Mock data for refrigeration services
  const refrigerationServices = [
    {
      id: 1,
      name: "Ocean Fresh Cooling Co.",
      service: "Mobile Refrigeration Units",
      description: "Portable refrigeration solutions for fishing vessels and temporary storage",
      costPerHour: 2500,
      costPerDay: 15000,
      rating: 4.8,
      reviews: 124,
      distance: 2.3,
      location: { lat: -1.286389, lng: 36.817223 }, // Nairobi coordinates
      contact: "+254 712 345 678",
      email: "info@oceanfresh.co.ke",
      features: ["24/7 Service", "Emergency Repairs", "Mobile Units", "Temperature Monitoring"],
      image: "/assets/images/refrigeration1.jpg"
    },
    {
      id: 2,
      name: "Deep Freeze Solutions",
      service: "Cold Storage Facilities",
      description: "Large-scale cold storage with advanced temperature control systems",
      costPerHour: 1800,
      costPerDay: 12000,
      rating: 4.6,
      reviews: 89,
      distance: 5.1,
      location: { lat: -1.300000, lng: 36.800000 },
      contact: "+254 723 456 789",
      email: "support@deepfreeze.co.ke",
      features: ["Bulk Storage", "Real-time Monitoring", "Backup Power", "Hygienic Facilities"],
      image: "/assets/images/refrigeration2.jpg"
    },
    {
      id: 3,
      name: "Arctic Marine Cooling",
      service: "Marine Refrigeration Systems",
      description: "Specialized cooling systems designed for marine environments",
      costPerHour: 3200,
      costPerDay: 22000,
      rating: 4.9,
      reviews: 67,
      distance: 8.7,
      location: { lat: -1.270000, lng: 36.830000 },
      contact: "+254 734 567 890",
      email: "marine@arcticcooling.co.ke",
      features: ["Marine Grade", "Saltwater Resistant", "Vessel Installation", "Maintenance Contracts"],
      image: "/assets/images/refrigeration3.jpg"
    },
    {
      id: 4,
      name: "Quick Chill Services",
      service: "Rapid Cooling & Blast Freezing",
      description: "Fast-acting cooling solutions for immediate preservation needs",
      costPerHour: 2800,
      costPerDay: 18000,
      rating: 4.7,
      reviews: 156,
      distance: 3.5,
      location: { lat: -1.290000, lng: 36.810000 },
      contact: "+254 745 678 901",
      email: "chill@quickchill.co.ke",
      features: ["Blast Freezing", "Quick Response", "Mobile Teams", "Quality Assurance"],
      image: "/assets/images/refrigeration4.jpg"
    },
    {
      id: 5,
      name: "Eco Cool Kenya",
      service: "Sustainable Refrigeration",
      description: "Environmentally friendly cooling solutions using green technology",
      costPerHour: 2200,
      costPerDay: 14000,
      rating: 4.5,
      reviews: 92,
      distance: 6.2,
      location: { lat: -1.280000, lng: 36.790000 },
      contact: "+254 756 789 012",
      email: "green@ecocool.co.ke",
      features: ["Solar Powered", "Energy Efficient", "Eco-friendly", "Cost Effective"],
      image: "/assets/images/refrigeration5.jpg"
    },
    {
      id: 6,
      name: "Fisherman's Ice Co.",
      service: "Ice Production & Distribution",
      description: "Reliable ice supply and distribution services for fishing communities",
      costPerHour: 1500,
      costPerDay: 9000,
      rating: 4.4,
      reviews: 203,
      distance: 1.8,
      location: { lat: -1.285000, lng: 36.815000 },
      contact: "+254 767 890 123",
      email: "ice@fishermans.co.ke",
      features: ["24/7 Ice Supply", "Bulk Discounts", "Delivery Service", "Freshwater Ice"],
      image: "/assets/images/refrigeration6.jpg"
    }
  ];

  // Sort services by distance
  const sortedServices = [...refrigerationServices].sort((a, b) => a.distance - b.distance);

  // Rotate background images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % headerImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [headerImages.length]);

  // Get user location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setLoadingLocation(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Could not get your location. Using default distances.");
        setLoadingLocation(false);
      }
    );
  };

//   // Calculate distance between two coordinates (Haversine formula)
//   const calculateDistance = (lat1, lon1, lat2, lon2) => {
//     const R = 6371; // Earth's radius in km
//     const dLat = (lat2 - lat1) * Math.PI / 180;
//     const dLon = (lon2 - lon1) * Math.PI / 180;
//     const a = 
//       Math.sin(dLat/2) * Math.sin(dLat/2) +
//       Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
//       Math.sin(dLon/2) * Math.sin(dLon/2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
//     return R * c;
//   };

  const handleBookService = (service) => {
    alert(`Booking request sent to ${service.name}! They will contact you at ${user?.email || 'your registered email'} shortly.`);
  };

  const handleContactService = (service) => {
    alert(`Contacting ${service.name} at ${service.contact}`);
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
                alt={`Refrigeration scene ${idx + 1}`}
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
              <div className="relative w-20 h-20 bg-gradient-to-br from-cyan-400 via-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <span className="text-4xl">❄️</span>
              </div>
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Refrigeration Services</h1>
              <p className="text-cyan-200 text-lg">Keep your catch fresh with trusted cooling partners</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {[
              { icon: "🏢", label: "Service Providers", value: refrigerationServices.length, color: "from-blue-500 to-cyan-500" },
              { icon: "📍", label: "Nearest Service", value: `${sortedServices[0]?.distance} km`, color: "from-green-500 to-emerald-500" },
              { icon: "💰", label: "Avg. Cost/Day", value: "KSH 15,000", color: "from-purple-500 to-pink-500" }
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
        {/* Location Section */}
        <div className="bg-gray-800/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/50 p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Find Services Near You</h2>
              <p className="text-gray-400">Enable location to find the closest refrigeration services</p>
            </div>
            <button
              onClick={getUserLocation}
              disabled={loadingLocation}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:scale-105 disabled:opacity-50 flex items-center space-x-2"
            >
              {loadingLocation ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Locating...</span>
                </>
              ) : (
                <>
                  <span>📍</span>
                  <span>Use My Location</span>
                </>
              )}
            </button>
          </div>
          {userLocation && (
            <div className="mt-4 p-4 bg-green-900/20 border border-green-500/30 rounded-xl">
              <p className="text-green-400">📍 Location found! Showing services sorted by distance</p>
            </div>
          )}
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedServices.map((service, idx) => (
            <div 
              key={service.id}
              className="group bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 hover:border-cyan-500/50 transition-all duration-300 overflow-hidden hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/20"
              style={{
                animation: `fadeInUp 0.5s ease-out ${idx * 0.1}s both`
              }}
            >
              {/* Service Header */}
              <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 p-6 border-b border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      ❄️
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{service.name}</h3>
                      <p className="text-cyan-400 text-sm">{service.service}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1 bg-yellow-500/20 px-2 py-1 rounded-lg">
                      <span className="text-yellow-400">⭐</span>
                      <span className="text-white text-sm font-bold">{service.rating}</span>
                    </div>
                    <p className="text-gray-400 text-xs mt-1">{service.reviews} reviews</p>
                  </div>
                </div>
                
                {/* Distance Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 bg-green-500/20 px-3 py-1 rounded-full">
                    <span className="text-green-400">📍</span>
                    <span className="text-white text-sm font-semibold">{service.distance} km away</span>
                  </div>
                  {idx === 0 && (
                    <div className="bg-red-500/20 px-3 py-1 rounded-full">
                      <span className="text-red-400 text-sm font-semibold">Closest 🔥</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Service Body */}
              <div className="p-6 space-y-4">
                <p className="text-gray-300 text-sm leading-relaxed">{service.description}</p>

                {/* Pricing */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                    <p className="text-gray-400 text-xs">Per Hour</p>
                    <p className="text-white font-bold text-lg">KSH {service.costPerHour.toLocaleString()}</p>
                  </div>
                  <div className="bg-cyan-500/20 rounded-lg p-3 text-center border border-cyan-500/30">
                    <p className="text-cyan-400 text-xs">Per Day</p>
                    <p className="text-white font-bold text-lg">KSH {service.costPerDay.toLocaleString()}</p>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  <p className="text-gray-400 text-sm font-semibold">Features:</p>
                  <div className="flex flex-wrap gap-2">
                    {service.features.map((feature, featureIdx) => (
                      <span 
                        key={featureIdx}
                        className="bg-gray-700/50 text-cyan-400 text-xs px-2 py-1 rounded-full border border-cyan-500/30"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 pt-2 border-t border-gray-700">
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-gray-400">📞</span>
                    <span className="text-white">{service.contact}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-gray-400">📧</span>
                    <span className="text-white truncate">{service.email}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-4">
                  <button
                    onClick={() => handleBookService(service)}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    Book Now
                  </button>
                  <button
                    onClick={() => handleContactService(service)}
                    className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-white py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    Contact
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-gray-800/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/50 p-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">Why Choose Our Refrigeration Partners?</h3>
              <div className="space-y-3">
                {[
                  { icon: "⚡", text: "Quick response times for emergency cooling needs" },
                  { icon: "💰", text: "Competitive pricing with transparent costs" },
                  { icon: "🛡️", text: "Verified and rated service providers" },
                  { icon: "🌱", text: "Eco-friendly and sustainable cooling solutions" },
                  { icon: "📱", text: "Easy booking and contact through the platform" }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-3">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-gray-300">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-cyan-500/10 rounded-2xl p-6 border border-cyan-500/20">
              <h4 className="text-xl font-bold text-white mb-3">Need Immediate Help?</h4>
              <p className="text-cyan-200 mb-4">Contact our support team for urgent refrigeration needs</p>
              <div className="space-y-2 text-sm">
                <p className="text-white">📞 Emergency Hotline: <strong>+254 700 123 456</strong></p>
                <p className="text-white">📧 Email: <strong>emergency@bluechain.com</strong></p>
                <p className="text-white">🕒 Available: <strong>24/7</strong></p>
              </div>
            </div>
          </div>
        </div>
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
      `}</style>
    </div>
  );
}