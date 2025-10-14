import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Pricing() {
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(0);
  const [setSelectedPlan] = useState("free");

  const images = [
    "//images/oceanScenery.jpeg",
    "//images/oceanscenery2.jpeg",
    "//images/fishermenGrowth.jpeg",
    "//images/financialGrowth.jpeg"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [images.length]);

  const plans = [
    {
      id: "free",
      name: "Free",
      subtitle: "Basic",
      price: "Free",
      priceDetail: "Forever",
      description: "Perfect for getting started with BlueChain AI",
      icon: "🌊",
      gradient: "from-blue-500 to-cyan-500",
      features: [
        { text: "Activity logging", included: true },
        { text: "Basic analytics dashboard", included: true },
        { text: "Marketplace access", included: true },
        { text: "Community features", included: true },
        { text: "Mobile app access", included: true },
        { text: "AI forecasts", included: false },
        { text: "Credit scoring", included: false },
        { text: "Advanced insights", included: false }
      ],
      buttonText: "Current Plan",
      buttonDisabled: true,
      popular: false
    },
    {
      id: "premium",
      name: "Premium",
      subtitle: "Most Popular",
      price: "KES 500-800",
      priceDetail: "$3-5 / month",
      description: "Unlock AI-powered insights for smarter decisions",
      icon: "⚡",
      gradient: "from-cyan-500 to-teal-500",
      features: [
        { text: "Everything in Free", included: true },
        { text: "AI catch forecasts", included: true },
        { text: "Credit scoring system", included: true },
        { text: "Real-time price insights", included: true },
        { text: "Weather predictions", included: true },
        { text: "Market demand analytics", included: true },
        { text: "Priority support", included: true },
        { text: "Sustainability scorecard", included: false }
      ],
      buttonText: "Upgrade to Premium",
      buttonDisabled: false,
      popular: true
    },
    {
      id: "premium-plus",
      name: "Premium+",
      subtitle: "Professional",
      price: "KES 1,500-2,000",
      priceDetail: "$10-15 / month",
      description: "Complete AI suite for professional operations",
      icon: "💎",
      gradient: "from-teal-500 to-green-500",
      features: [
        { text: "Everything in Premium", included: true },
        { text: "Sustainability scorecard", included: true },
        { text: "Export market finder", included: true },
        { text: "AI chat assistant", included: true },
        { text: "Offline AI models", included: true },
        { text: "Custom reports", included: true },
        { text: "API access", included: true },
        { text: "Dedicated account manager", included: true }
      ],
      buttonText: "Upgrade to Premium+",
      buttonDisabled: false,
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        {images.map((img, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-2000 ${
              currentImage === idx ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={img}
              alt={`Background ${idx + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-blue-900/85 to-gray-900/90"></div>
          </div>
        ))}
      </div>

      {/* Animated Overlay Pattern */}
      <div className="fixed inset-0 z-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgwLDIyNSwyNTUsMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>

      {/* Floating Bubbles */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-cyan-400/10 border border-cyan-400/20"
            style={{
              width: `${Math.random() * 60 + 20}px`,
              height: `${Math.random() * 60 + 20}px`,
              left: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 15 + 10}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
              bottom: "-100px",
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-300 hover:text-cyan-400 transition-colors group"
            >
              <span className="text-xl group-hover:-translate-x-1 transition-transform duration-300">←</span>
              <span className="font-medium">Back</span>
            </button>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-500 rounded-xl blur-lg opacity-50 animate-pulse"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-2xl">
                  <span className="text-2xl">🌊</span>
                </div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                BlueChain AI
              </span>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 bg-cyan-500/20 backdrop-blur-sm rounded-full px-5 py-2 mb-6 border border-cyan-400/30">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
              <span className="text-sm font-medium text-cyan-300">Flexible Pricing Plans</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400 bg-clip-text text-transparent">
                Choose Your AI Plan
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Start with our free plan and upgrade anytime to unlock powerful AI insights 
              that help you maximize profits and sustainability.
            </p>

            {/* Billing Toggle (Future feature) */}
            <div className="flex items-center justify-center space-x-4 mb-12">
              <span className="text-gray-400">Monthly</span>
              <div className="relative inline-block w-16 h-8 rounded-full bg-gray-700 border border-gray-600">
                <div className="absolute left-1 top-1 w-6 h-6 bg-cyan-500 rounded-full shadow-lg transition-transform duration-300"></div>
              </div>
              <span className="text-gray-400">Annual <span className="text-green-400 text-sm font-semibold">(Save 20%)</span></span>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="px-4 sm:px-6 lg:px-8 pb-20">
          <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative group ${
                  plan.popular ? 'md:-mt-4' : ''
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                      ⭐ Most Popular
                    </div>
                  </div>
                )}

                {/* Card Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${plan.gradient} rounded-3xl blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`}></div>

                {/* Card Content */}
                <div className={`relative bg-gray-800/60 backdrop-blur-xl rounded-3xl border-2 ${
                  plan.popular 
                    ? 'border-cyan-500 shadow-2xl shadow-cyan-500/20' 
                    : 'border-gray-700/50'
                } p-8 hover:border-cyan-500/50 transition-all duration-300 ${
                  plan.popular ? 'scale-105' : 'hover:scale-105'
                }`}>
                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r ${plan.gradient} rounded-2xl mb-6 text-4xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                      {plan.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <p className="text-cyan-400 text-sm font-semibold mb-4">{plan.subtitle}</p>
                    <div className="mb-2">
                      <span className="text-4xl font-bold text-white">{plan.price}</span>
                    </div>
                    <p className="text-gray-400 text-sm">{plan.priceDetail}</p>
                    <p className="text-gray-300 text-sm mt-4">{plan.description}</p>
                  </div>

                  {/* Features List */}
                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start space-x-3">
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                          feature.included 
                            ? `bg-gradient-to-r ${plan.gradient}` 
                            : 'bg-gray-700'
                        }`}>
                          <span className="text-white text-xs">
                            {feature.included ? '✓' : '✕'}
                          </span>
                        </div>
                        <span className={`text-sm ${
                          feature.included ? 'text-gray-200' : 'text-gray-500'
                        }`}>
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => !plan.buttonDisabled && setSelectedPlan(plan.id)}
                    disabled={plan.buttonDisabled}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                      plan.buttonDisabled
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : `bg-gradient-to-r ${plan.gradient} text-white hover:shadow-lg hover:shadow-cyan-500/50 hover:scale-105`
                    }`}
                  >
                    {plan.buttonText}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Comparison */}
        <section className="px-4 sm:px-6 lg:px-8 pb-20">
          <div className="max-w-5xl mx-auto">
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-3xl border border-gray-700/50 p-8">
              <h3 className="text-3xl font-bold text-center mb-8">
                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Why Upgrade?
                </span>
              </h3>
              
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    icon: "🤖",
                    title: "AI-Powered Forecasts",
                    desc: "Predict catch volumes, weather patterns, and market demand with advanced machine learning",
                    color: "from-blue-500 to-cyan-500"
                  },
                  {
                    icon: "💰",
                    title: "Smart Credit Scoring",
                    desc: "Build your credit profile and access better financing opportunities through verified data",
                    color: "from-cyan-500 to-teal-500"
                  },
                  {
                    icon: "📊",
                    title: "Market Intelligence",
                    desc: "Real-time price insights, demand trends, and export opportunities to maximize profits",
                    color: "from-teal-500 to-green-500"
                  }
                ].map((benefit, idx) => (
                  <div key={idx} className="text-center group">
                    <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${benefit.color} rounded-2xl mb-4 text-3xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                      {benefit.icon}
                    </div>
                    <h4 className="text-white font-bold mb-2">{benefit.title}</h4>
                    <p className="text-gray-400 text-sm">{benefit.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ / Notes */}
        <section className="px-4 sm:px-6 lg:px-8 pb-20">
          <div className="max-w-4xl mx-auto">
            <div className="bg-blue-900/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <span className="text-3xl mr-3">💡</span>
                Important Information
              </h3>
              <ul className="space-y-4 text-blue-200">
                <li className="flex items-start space-x-3">
                  <span className="text-cyan-400 mt-1">•</span>
                  <span>Prices shown are indicative and may vary. Local taxes or fees may apply.</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-cyan-400 mt-1">•</span>
                  <span>You can cancel or change your plan at any time with no penalties.</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-cyan-400 mt-1">•</span>
                  <span>Upgrading unlocks advanced AI insights to help optimize your fishing decisions and maximize income.</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-cyan-400 mt-1">•</span>
                  <span>All plans include access to the BlueChain community and marketplace features.</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-cyan-400 mt-1">•</span>
                  <span>Mobile money (M-Pesa) and other local payment methods are supported.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 sm:px-6 lg:px-8 pb-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 rounded-3xl p-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB4PSIwIiB5PSIwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCBmaWxsPSJ1cmwoI3BhdHRlcm4pIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+')] opacity-20"></div>
              <div className="relative">
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Ready to Get Started?
                </h3>
                <p className="text-xl text-blue-100 mb-8">
                  Join thousands of coastal fishers using AI to grow their business
                </p>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-white text-blue-600 hover:bg-blue-50 px-10 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-2xl hover:shadow-white/30 hover:scale-105"
                >
                  Go to Dashboard →
                </button>
              </div>
            </div>
          </div>
        </section>
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
      `}</style>
    </div>
  );
}