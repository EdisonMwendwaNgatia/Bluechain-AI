import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-hidden">
      {/* Animated Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrollY > 50 ? 'bg-gray-900/95 backdrop-blur-lg shadow-2xl' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
                  <span className="text-2xl">🌊</span>
                </div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                BlueChain
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-cyan-400 transition-colors duration-300 relative group">
                Features
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300"></span>
              </a>
              <a href="#impact" className="text-gray-300 hover:text-cyan-400 transition-colors duration-300 relative group">
                Impact
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300"></span>
              </a>
              <a href="#how-it-works" className="text-gray-300 hover:text-cyan-400 transition-colors duration-300 relative group">
                How It Works
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300"></span>
              </a>
              <button 
                onClick={() => navigate('/login')}
                className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors duration-300"
              >
                Login
              </button>
              <button 
                onClick={() => navigate('/signup')}
                className="relative group overflow-hidden bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 px-6 py-2.5 rounded-full font-semibold transition-all duration-300 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105"
              >
                <span className="relative z-10">Join Pilot</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Ocean Image */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Ocean Background Image with Parallax */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            transform: `translateY(${scrollY * 0.5}px)`,
            transition: 'transform 0.1s ease-out'
          }}
        >
          <img 
            src="/assets/images/oceanScenery.jpeg" 
            alt="Ocean Scenery" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-900/50 to-gray-900"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-cyan-900/30"></div>
        </div>

        {/* Animated Waves Overlay */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-24 md:h-32">
            <path 
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
              className="fill-current text-cyan-500/20"
              style={{
                animation: 'wave 7s ease-in-out infinite',
                animationDelay: '0s'
              }}
            />
            <path 
              d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" 
              className="fill-current text-blue-500/30"
              style={{
                animation: 'wave 10s ease-in-out infinite',
                animationDelay: '-2s'
              }}
            />
          </svg>
        </div>

        {/* Floating Bubbles Animation */}
        <div className="absolute inset-0 z-5 pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-cyan-400/20"
              style={{
                width: `${Math.random() * 40 + 10}px`,
                height: `${Math.random() * 40 + 10}px`,
                left: `${Math.random() * 100}%`,
                animation: `float ${Math.random() * 10 + 10}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`,
                bottom: '-100px'
              }}
            />
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
          <div 
            className="inline-flex items-center space-x-2 bg-cyan-500/20 backdrop-blur-md rounded-full px-5 py-2 mb-8 border border-cyan-400/30"
            style={{
              animation: 'fadeInUp 1s ease-out'
            }}
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
            <span className="text-sm font-medium text-cyan-300">Live Pilot Program Now Available</span>
          </div>
          
          <h1 
            className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-6"
            style={{
              animation: 'fadeInUp 1s ease-out 0.2s both'
            }}
          >
            <span className="block text-white mb-2">Sustainable</span>
            <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Blue Economy
            </span>
            <span className="block text-white mt-2">Powered BlueChain</span>
          </h1>
          
          <p 
            className="text-xl md:text-2xl text-gray-300 leading-relaxed mb-12 max-w-4xl mx-auto"
            style={{
              animation: 'fadeInUp 1s ease-out 0.4s both'
            }}
          >
            Empowering Coastal Communities with smart traceability, 
            predictive insights, and sustainable growth for the blue economy.
          </p>
          
          <div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            style={{
              animation: 'fadeInUp 1s ease-out 0.6s both'
            }}
          >
            <button 
              onClick={() => navigate('/signup')}
              className="group relative overflow-hidden bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 shadow-2xl shadow-cyan-500/40 hover:shadow-cyan-500/60 hover:scale-105"
            >
              <span className="relative z-10 flex items-center space-x-2">
                <span>Join Coastal Network</span>
                <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            <a 
              href="#features" 
              className="group border-2 border-cyan-400/50 hover:border-cyan-400 text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 backdrop-blur-sm bg-white/5 hover:bg-white/10"
            >
              <span className="flex items-center space-x-2">
                <span>Explore Platform</span>
                <span className="group-hover:translate-y-1 transition-transform duration-300">↓</span>
              </span>
            </a>
          </div>
          
          <div 
            className="mt-12 flex flex-wrap justify-center gap-6 text-cyan-300"
            style={{
              animation: 'fadeInUp 1s ease-out 0.8s both'
            }}
          >
            <div className="flex items-center space-x-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full border border-cyan-500/30">
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/50">
                <span className="text-white text-sm">✓</span>
              </div>
              <span>Secure</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full border border-cyan-500/30">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/50">
                <span className="text-white text-sm">✓</span>
              </div>
              <span>BlueChain Powered</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full border border-cyan-500/30">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/50">
                <span className="text-white text-sm">✓</span>
              </div>
              <span>Community First</span>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex flex-col items-center animate-bounce">
            <span className="text-cyan-400 text-sm mb-2">Scroll to explore</span>
            <div className="w-6 h-10 border-2 border-cyan-400 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-cyan-400 rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section with fishermenGrowth.jpeg */}
      <section className="relative py-24 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
              <div className="relative overflow-hidden rounded-3xl border-2 border-red-500/30 shadow-2xl">
                <img 
                  src="/assets/images/fishermenGrowth.jpeg" 
                  alt="Coastal Challenges" 
                  className="w-full h-96 object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="bg-red-500/90 backdrop-blur-sm rounded-xl p-4 border border-red-400/30">
                    <p className="text-white font-bold text-3xl mb-1">40%</p>
                    <p className="text-red-100 text-sm">Post-Harvest Loss Rate</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                The Coastal Challenge
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed mb-8">
                Coastal communities face multiple challenges that limit incomes and conservation efforts: 
                lack of financing for fishers, high post-harvest losses, illegal fishing, and poor conservation funding.
              </p>
              
              <div className="space-y-4">
                {[
                  { icon: "🐟", title: "Massive Losses", desc: "Up to 40% of catch spoils before reaching market" },
                  { icon: "💰", title: "Limited Financing", desc: "Fishers struggle to access credit facilities" },
                  { icon: "🌊", title: "Conservation Gap", desc: "Insufficient funding for marine protection" }
                ].map((item, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-start space-x-4 bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700 hover:border-red-500/50 transition-all duration-300 group"
                  >
                    <div className="text-3xl group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
                    <div>
                      <h4 className="font-bold text-lg text-white mb-1">{item.title}</h4>
                      <p className="text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-24 bg-gradient-to-b from-gray-900 via-blue-900/20 to-gray-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgwLDIyNSwyNTUsMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Comprehensive tools designed specifically for coastal community challenges
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { 
                icon: "📱", 
                title: "Mobile First", 
                desc: "Works in low-connectivity areas with offline capabilities.",
                gradient: "from-blue-600 to-purple-600"
              },
              { 
                icon: "📊", 
                title: "Credit Scoring", 
                desc: "Assess repayment probability from operational and environmental data.",
                gradient: "from-purple-500 to-blue-500"
              },
              { 
                icon: "💎", 
                title: "Conservation Credits(Bluechain Coins)", 
                desc: "Tradable tokens tied to verified conservation outcomes.",
                gradient: "from-teal-500 to-green-500"
              }
            ].map((feature, idx) => (
              <div 
                key={idx} 
                className="group relative overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 hover:border-cyan-500/50 transition-all duration-500 hover:-translate-y-2"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                <div className="relative p-8">
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl mb-6 text-3xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                    {feature.icon}
                  </div>
                  <h4 className="text-xl font-bold text-white mb-3">{feature.title}</h4>
                  <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                </div>
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section with Financial Growth Image */}
      <section id="impact" className="relative py-24 bg-gradient-to-b from-gray-900 via-teal-900/20 to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
              Measurable Impact
            </h2>
            <p className="text-xl text-gray-400">Creating sustainable value across the coastal ecosystem</p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-teal-500/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
              <div className="relative overflow-hidden rounded-3xl border-2 border-green-500/30 shadow-2xl">
                <img 
                  src="/assets/images/financialGrowth.jpeg" 
                  alt="Financial Growth" 
                  className="w-full h-96 object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-500/90 backdrop-blur-sm rounded-xl p-4 border border-green-400/30">
                      <p className="text-white font-bold text-3xl mb-1">2.5x</p>
                      <p className="text-green-100 text-sm">Income Growth</p>
                    </div>
                    <div className="bg-teal-500/90 backdrop-blur-sm rounded-xl p-4 border border-teal-400/30">
                      <p className="text-white font-bold text-3xl mb-1">100+</p>
                      <p className="text-teal-100 text-sm">MSMEs Served</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              {[
                {
                  title: "Coastal MSMEs",
                  items: ["Better financing access", "Reduced losses", "Fair market prices", "Sustainable practices"],
                  color: "blue"
                },
                {
                  title: "Tourists & Donors",
                  items: ["Transparent tracking", "Direct support"],
                  color: "teal"
                },
                {
                  title: "Governments & NGOs",
                  items: ["Auditable data", "Policy support", "IUU monitoring", "SDG alignment"],
                  color: "cyan"
                }
              ].map((group, idx) => (
                <div 
                  key={idx} 
                  className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 hover:border-cyan-500/50 transition-all duration-300 hover:translate-x-2"
                >
                  <h3 className="text-2xl font-bold text-white mb-4">{group.title}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {group.items.map((item, i) => (
                      <div key={i} className="flex items-center space-x-2 text-gray-300">
                        <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative py-24 bg-gradient-to-b from-gray-900 via-blue-900/10 to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              How BlueChain Works
            </h2>
            <p className="text-xl text-gray-400">Simple four-step process to transform coastal economies</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Register Activity",
                desc: "MSMEs log daily catch, sales, and conservation actions",
                icon: "📝",
                color: "from-blue-500 to-cyan-500"
              },
              {
                step: "2",
                title: "Analysis",
                desc: "Smart forecasting and credit assessment",
                icon: "🤖",
                color: "from-cyan-500 to-teal-500"
              },
              {
                step: "3",
                title: "Top Verification",
                desc: "Payments handled by adminstrators",
                icon: "🔗",
                color: "from-teal-500 to-green-500"
              },
              {
                step: "4",
                title: "Track Impact",
                desc: "Transparent dashboards show real results",
                icon: "📊",
                color: "from-green-500 to-emerald-500"
              }
            ].map((step, idx) => (
              <div key={idx} className="relative group">
                <div className="text-center">
                  <div className="relative mx-auto w-24 h-24 mb-6">
                    <div className={`absolute inset-0 bg-gradient-to-r ${step.color} rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300`}></div>
                    <div className={`relative w-full h-full bg-gradient-to-br ${step.color} rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-2xl`}>
                      <span className="text-4xl">{step.icon}</span>
                    </div>
                    <div className="absolute -top-2 -right-2 w-10 h-10 bg-gray-800 border-2 border-cyan-400 text-cyan-400 rounded-full flex items-center justify-center text-lg font-bold shadow-lg">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-gray-400">{step.desc}</p>
                </div>
                {idx < 3 && (
                  <div className="hidden lg:block absolute top-12 -right-4 text-cyan-400 text-4xl">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Logo Section */}
      <section className="relative py-24 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
              <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-12 border-2 border-cyan-500/30 shadow-2xl flex items-center justify-center">
                <img 
                  src="/assets/images/logo.jpg" 
                  alt="BlueChain Logo" 
                  className="max-w-full h-auto transform group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
            
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                About BlueChain 
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed mb-6">
                BlueChain is a locally-rooted initiative supporting coastal communities across Kenya and East Africa.we combine deep local understanding with cutting-edge 
                technology to create practical, sustainable solutions.
              </p>
              <p className="text-lg text-gray-400 leading-relaxed mb-8">
                Our mission is to increase incomes, reduce waste, create jobs and make conservation fundable and traceable through 
                transparent technology that serves both people and planet.
              </p>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/30">
                  <p className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">100+</p>
                  <p className="text-gray-300">MSMEs Served    (pilot programme projection)</p>
                </div>
                <div className="bg-gradient-to-br from-cyan-500/20 to-teal-500/20 backdrop-blur-sm rounded-2xl p-6 border border-cyan-500/30">
                  <p className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent mb-2">30%+</p>
                  <p className="text-gray-300">Loss Reduction projection</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ocean Scenery 2 Section - Community Vision */}
      <section className="relative py-24 bg-gradient-to-b from-gray-800 to-gray-900 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Preserving Ocean Beauty
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed mb-6">
                Every action on our platform contributes to protecting the breathtaking marine ecosystems that sustain 
                coastal communities. We ensure that economic growth 
                goes hand-in-hand with ocean conservation.
              </p>
              <ul className="space-y-4">
                {[
                  { icon: "🌊", text: "Real-time ocean health monitoring" },
                  { icon: "🐠", text: "Sustainable fishing practice verification" },
                  { icon: "🌍", text: "Carbon credit generation from conservation" },
                  { icon: "💙", text: "Community-led marine protection initiatives" }
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center space-x-4 text-gray-300">
                    <span className="text-3xl">{item.icon}</span>
                    <span className="text-lg">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
              <div className="relative overflow-hidden rounded-3xl border-2 border-teal-500/30 shadow-2xl">
                <img 
                  src="/assets/images/oceanscenery2.jpeg" 
                  alt="Ocean Conservation" 
                  className="w-full h-96 object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="bg-teal-500/90 backdrop-blur-sm rounded-xl p-4 border border-teal-400/30">
                    <p className="text-white font-bold text-2xl mb-1">Marine Conservation</p>
                    <p className="text-teal-100 text-sm">Protecting our oceans for future generations</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB4PSIwIiB5PSIwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCBmaWxsPSJ1cmwoI3BhdHRlcm4pIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+')] opacity-30"></div>
        
        {/* Animated waves */}
        <div className="absolute top-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-16">
            <path 
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
              className="fill-current text-gray-900"
            />
          </svg>
        </div>
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Join the Coastal Revolution
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto">
            Be part of transforming coastal communities through sustainable technology. 
            Together, we can create a thriving blue economy.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button 
              onClick={() => navigate('/signup')}
              className="group relative overflow-hidden bg-white text-blue-600 hover:bg-blue-50 px-10 py-5 rounded-full font-bold text-xl transition-all duration-300 shadow-2xl hover:shadow-white/30 hover:scale-105"
            >
              <span className="relative z-10 flex items-center space-x-2">
                <span>Get Started Now</span>
                <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
              </span>
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="border-2 border-white text-white hover:bg-white/10 px-10 py-5 rounded-full font-bold text-xl transition-all duration-300 backdrop-blur-sm"
            >
              Sign In
            </button>
          </div>
          
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-blue-100">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">✓</span>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">✓</span>
              <span>Free pilot program</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">✓</span>
              <span>Community support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-cyan-500 rounded-xl blur-lg opacity-50"></div>
                  <div className="relative w-12 h-12 bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🌊</span>
                  </div>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  BlueChain
                </span>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Empowering coastal communities for a sustainable blue economy.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-12 h-12 bg-gray-800 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-500 rounded-xl flex items-center justify-center transition-all duration-300 group">
                  <span className="text-xl group-hover:scale-110 transition-transform">🐦</span>
                </a>
                <a href="#" className="w-12 h-12 bg-gray-800 hover:bg-gradient-to-r hover:from-blue-600 hover:to-cyan-500 rounded-xl flex items-center justify-center transition-all duration-300 group">
                  <span className="text-xl group-hover:scale-110 transition-transform">💼</span>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-bold text-white mb-6">Platform</h4>
              <ul className="space-y-3">
                <li><a href="#features" className="text-gray-400 hover:text-cyan-400 transition-colors flex items-center group"><span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>Features</a></li>
                <li><a href="#impact" className="text-gray-400 hover:text-cyan-400 transition-colors flex items-center group"><span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>Impact</a></li>
                <li><a href="#how-it-works" className="text-gray-400 hover:text-cyan-400 transition-colors flex items-center group"><span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>How It Works</a></li>
                <li><button onClick={() => navigate('/login')} className="text-gray-400 hover:text-cyan-400 transition-colors flex items-center group"><span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>Login</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-bold text-white mb-6">Contact</h4>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3 text-gray-400">
                  <span className="text-cyan-400">📧</span>
                  <a href="mailto:hello@bluechain.com" className="hover:text-cyan-400 transition-colors">hello@bluechain.com</a>
                </li>
                <li className="flex items-start space-x-3 text-gray-400">
                  <span className="text-cyan-400">📱</span>
                  <span>+254 700 000 000</span>
                </li>
                <li className="flex items-start space-x-3 text-gray-400">
                  <span className="text-cyan-400">📍</span>
                  <span>Coastal Kenya & Kajiado</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-bold text-white mb-6">Newsletter</h4>
              <p className="text-gray-400 mb-4">Stay updated on coastal initiatives</p>
              <div className="flex flex-col space-y-3">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className="bg-gray-800 text-white px-4 py-3 rounded-xl border border-gray-700 focus:outline-none focus:border-cyan-500 transition-colors"
                />
                <button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-center md:text-left mb-4 md:mb-0">
              © {new Date().getFullYear()} BlueChain. Empowering coastal communities through technology.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

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

        @keyframes wave {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

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
      `}</style>
    </div>
  );
}