import React, { useState, useEffect } from 'react';
import { getDatabase, ref, push, set } from 'firebase/database';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { app } from '../firebase';

const DataFeed = () => {
  const navigate = useNavigate();
  const db = getDatabase(app);
  const { user: currentUser } = useAuth();
  const [currentImage, setCurrentImage] = useState(0);

  // Background images for slideshow
  const backgroundImages = [
    "/assets/images/oceanScenery.jpeg",
    "/assets/images/fishermenGrowth.jpeg",
    "/assets/images/oceanscenery2.jpeg",
  ];

  const [formData, setFormData] = useState({
    catchImage: null,
    catchType: '',
    species: '',
    volume: '',
    location: '',
    catchDate: new Date().toISOString().split('T')[0],
    catchTime: new Date().toTimeString().split(' ')[0].substring(0, 5),
    storageMethod: '',
    buyer: '',
    pricePerKg: '',
    notes: '',
  });

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [localCatches, setLocalCatches] = useState([]);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);

  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash';

  // Debug: Log current user info
  useEffect(() => {
    if (currentUser) {
      console.log('🔍 CURRENT USER DEBUG:', {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName,
        fullUserObject: currentUser
      });
    }
  }, [currentUser]);

  // Background slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % backgroundImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  // Local caching + connectivity
  useEffect(() => {
    const storedCatches = JSON.parse(localStorage.getItem('localCatches')) || [];
    setLocalCatches(storedCatches);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-sync (future)
  useEffect(() => {
    if (isOnline && localCatches.length > 0) {
      console.log('Online, syncing local catches:', localCatches);
    }
  }, [isOnline, localCatches]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const convertImageToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const analyzeImageWithGemini = async (base64Image, file) => {
    if (!GEMINI_API_KEY) {
      setAnalysisError('Gemini API key not set.');
      return null;
    }

    const mimeType = file?.type || 'image/jpeg';
    setIsAnalyzingImage(true);
    setAnalysisError(null);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Analyze this image of a marine catch and return JSON with:
- "species": name of species,
- "volume": estimated quantity (e.g. "5 kg", "10 pieces"),
- "catchType": fish, crustacean, mollusk, or other.`,
                  },
                  {
                    inline_data: {
                      mime_type: mimeType,
                      data: base64Image.split(',')[1],
                    },
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.candidates?.length > 0) {
        const rawText = data.candidates[0]?.content?.parts?.[0]?.text?.trim();
        const jsonStart = rawText.indexOf('{');
        const jsonEnd = rawText.lastIndexOf('}');
        const jsonString = rawText.slice(jsonStart, jsonEnd + 1);

        const parsed = JSON.parse(jsonString);
        return parsed;
      } else {
        setAnalysisError(data.error?.message || 'Failed to analyze image.');
        return null;
      }
    } catch (error) {
      console.error('Gemini network error:', error);
      setAnalysisError('Network or API failure.');
      return null;
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, catchImage: file }));

    if (file) {
      // Create preview
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);

      const base64 = await convertImageToBase64(file);
      const analysis = await analyzeImageWithGemini(base64, file);
      if (analysis) {
        setFormData((prev) => ({
          ...prev,
          species: analysis.species || prev.species,
          volume: analysis.volume || prev.volume,
          catchType: analysis.catchType || prev.catchType,
        }));
      }
    }
  };

  const handleLocationClick = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported.');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setFormData((prev) => ({
          ...prev,
          location: `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`,
        }));
      },
      () => alert('Could not get location.')
    );
  };

  const saveCatchLocally = (data) => {
    const updated = [...localCatches, {
      ...data,
      fisherId: currentUser.uid,
      fisherEmail: currentUser.email
    }];
    localStorage.setItem('localCatches', JSON.stringify(updated));
    setLocalCatches(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      alert('You must be logged in to log a catch.');
      return;
    }

    if (!isOnline) {
      saveCatchLocally(formData);
      alert('Offline: Catch saved locally and will sync later.');
      return;
    }

    try {
      const catchRef = push(ref(db, 'catches'));

      // Create the data object with the current user's info
      const catchData = {
        ...formData,
        fisherId: currentUser.uid,
        fisherEmail: currentUser.email,
        fisherName: currentUser.displayName || currentUser.email,
        createdAt: new Date().toISOString(),
      };

      // Debug: Log what we're about to send
      console.log('🚀 SENDING CATCH DATA:', catchData);

      await set(catchRef, catchData);

      alert('Catch logged successfully! 🎉');
      
      // Reset form
      setFormData({
        catchImage: null,
        catchType: '',
        species: '',
        volume: '',
        location: '',
        catchDate: new Date().toISOString().split('T')[0],
        catchTime: new Date().toTimeString().split(' ')[0].substring(0, 5),
        storageMethod: '',
        buyer: '',
        pricePerKg: '',
        notes: '',
      });
      setImagePreview(null);
      setCurrentStep(1);
    } catch (error) {
      console.error('Firebase error:', error);
      alert('Failed to log catch.');
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && !formData.catchImage) {
      alert('Please upload a catch photo first');
      return;
    }
    if (currentStep === 2 && (!formData.catchType || !formData.species || !formData.volume)) {
      alert('Please fill in all catch details');
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => setCurrentStep(currentStep - 1);

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Animated Background Slideshow */}
      <div className="fixed inset-0 z-0">
        {backgroundImages.map((img, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-2000 ${
              currentImage === idx ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={img}
              alt={`Ocean background ${idx + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-blue-900/80 to-cyan-900/85"></div>
          </div>
        ))}
      </div>

      {/* Floating Bubbles */}
      <div className="fixed inset-0 pointer-events-none z-5">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-cyan-400/10 border border-cyan-400/20"
            style={{
              width: `${Math.random() * 40 + 15}px`,
              height: `${Math.random() * 40 + 15}px`,
              left: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 15 + 10}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
              bottom: "-50px",
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-500 rounded-2xl blur-xl opacity-60 animate-pulse"></div>
                <div className="relative w-16 h-16 bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <span className="text-3xl">🐟</span>
                </div>
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Log Your Catch
              </span>
            </h1>
            <p className="text-gray-300 text-sm">
              {isOnline ? (
                <>Connected & Syncing <span className="text-green-400">●</span></>
              ) : (
                <>Offline Mode - Will sync later <span className="text-orange-400">●</span></>
              )}
            </p>
            {currentUser && (
              <div className="mt-2 text-xs text-gray-400">
                Logged in as: <strong>{currentUser.email}</strong>
                {currentUser.displayName && (
                  <> • {currentUser.displayName}</>
                )}
              </div>
            )}
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                    currentStep >= step
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 border-cyan-400 shadow-lg shadow-cyan-500/50'
                      : 'bg-gray-800 border-gray-600'
                  }`}>
                    <span className={`font-bold ${currentStep >= step ? 'text-white' : 'text-gray-500'}`}>
                      {step}
                    </span>
                  </div>
                  {step < 3 && (
                    <div className={`w-12 h-1 mx-2 rounded transition-all duration-300 ${
                      currentStep > step ? 'bg-gradient-to-r from-cyan-500 to-blue-600' : 'bg-gray-700'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-3 space-x-12 text-xs text-gray-400">
              <span className={currentStep === 1 ? 'text-cyan-400 font-semibold' : ''}>Upload</span>
              <span className={currentStep === 2 ? 'text-cyan-400 font-semibold' : ''}>Details</span>
              <span className={currentStep === 3 ? 'text-cyan-400 font-semibold' : ''}>Review</span>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-gray-800/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/50 overflow-hidden">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border-b border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                    {currentStep === 1 ? '📸' : currentStep === 2 ? '📝' : '✅'}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {currentStep === 1 ? 'Upload Catch Photo' : currentStep === 2 ? 'Catch Details' : 'Review & Submit'}
                    </h2>
                    <p className="text-gray-400 text-sm">
                      {currentStep === 1 ? 'AI will analyze your catch automatically' : currentStep === 2 ? 'Provide additional information' : 'Confirm your catch data'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/dashboard/fisher')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <span className="text-2xl">✕</span>
                </button>
              </div>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="p-8">
              {/* Step 1: Upload Photo */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Catch Photo <span className="text-red-400">*</span>
                    </label>
                    
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Catch preview"
                          className="w-full h-64 object-cover rounded-2xl border-2 border-cyan-500/30"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setFormData(prev => ({ ...prev, catchImage: null }));
                          }}
                          className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          disabled={isAnalyzingImage}
                          className="hidden"
                          id="catchImage"
                        />
                        <label
                          htmlFor="catchImage"
                          className="w-full bg-gray-900/50 border-2 border-dashed border-gray-600 hover:border-cyan-500 py-16 rounded-2xl transition-all duration-300 cursor-pointer flex flex-col items-center justify-center group"
                        >
                          <span className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">📸</span>
                          <span className="text-gray-400 group-hover:text-cyan-400 font-medium text-lg">
                            Click to upload catch photo
                          </span>
                          <span className="text-xs text-gray-500 mt-2">JPG, PNG or JPEG (max 10MB)</span>
                        </label>
                      </div>
                    )}

                    {isAnalyzingImage && (
                      <div className="mt-4 bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 flex items-center space-x-3">
                        <svg className="animate-spin h-5 w-5 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-blue-300">AI is analyzing your catch...</span>
                      </div>
                    )}

                    {analysisError && (
                      <div className="mt-4 bg-red-900/20 border border-red-500/30 rounded-xl p-4">
                        <p className="text-red-300">{analysisError}</p>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!formData.catchImage || isAnalyzingImage}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] flex items-center justify-center group"
                  >
                    <span>Continue to Details</span>
                    <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                  </button>
                </div>
              )}

              {/* Step 2: Catch Details */}
              {currentStep === 2 && (
                <div className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    {/* Catch Type */}
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Catch Type <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <span className="text-gray-400 text-lg">🐠</span>
                        </div>
                        <select
                          name="catchType"
                          value={formData.catchType}
                          onChange={handleInputChange}
                          className="w-full bg-gray-900/50 border border-gray-600 text-white pl-12 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 appearance-none cursor-pointer"
                          required
                        >
                          <option value="">Select type...</option>
                          <option value="fish">Fish</option>
                          <option value="crustacean">Crustacean</option>
                          <option value="mollusk">Mollusk</option>
                          <option value="aquatic_plant">Aquatic Plant</option>
                          <option value="other">Other</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                          <span className="text-gray-400">▼</span>
                        </div>
                      </div>
                    </div>

                    {/* Species */}
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Species <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <span className="text-gray-400 text-lg">🐟</span>
                        </div>
                        <input
                          type="text"
                          name="species"
                          value={formData.species}
                          onChange={handleInputChange}
                          placeholder="e.g., Tilapia, Mackerel"
                          className="w-full bg-gray-900/50 border border-gray-600 text-white pl-12 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 placeholder-gray-500"
                          required
                        />
                      </div>
                    </div>

                    {/* Volume */}
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Volume/Weight <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <span className="text-gray-400 text-lg">⚖️</span>
                        </div>
                        <input
                          type="text"
                          name="volume"
                          value={formData.volume}
                          onChange={handleInputChange}
                          placeholder="e.g., 5 kg, 10 pieces"
                          className="w-full bg-gray-900/50 border border-gray-600 text-white pl-12 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 placeholder-gray-500"
                          required
                        />
                      </div>
                    </div>

                    {/* Location */}
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Location <span className="text-red-400">*</span>
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <span className="text-gray-400 text-lg">📍</span>
                          </div>
                          <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            placeholder="Fishing location"
                            className="w-full bg-gray-900/50 border border-gray-600 text-white pl-12 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 placeholder-gray-500"
                            required
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleLocationClick}
                          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-4 py-3.5 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:scale-105 whitespace-nowrap"
                        >
                          📍 GPS
                        </button>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Catch Date <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <span className="text-gray-400 text-lg">📅</span>
                        </div>
                        <input
                          type="date"
                          name="catchDate"
                          value={formData.catchDate}
                          onChange={handleInputChange}
                          className="w-full bg-gray-900/50 border border-gray-600 text-white pl-12 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300"
                          required
                        />
                      </div>
                    </div>

                    {/* Time */}
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Catch Time <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <span className="text-gray-400 text-lg">🕐</span>
                        </div>
                        <input
                          type="time"
                          name="catchTime"
                          value={formData.catchTime}
                          onChange={handleInputChange}
                          className="w-full bg-gray-900/50 border border-gray-600 text-white pl-12 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300"
                          required
                        />
                      </div>
                    </div>

                    {/* Storage Method */}
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Storage Method <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <span className="text-gray-400 text-lg">❄️</span>
                        </div>
                        <select
                          name="storageMethod"
                          value={formData.storageMethod}
                          onChange={handleInputChange}
                          className="w-full bg-gray-900/50 border border-gray-600 text-white pl-12 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 appearance-none cursor-pointer"
                          required
                        >
                          <option value="">Select storage...</option>
                          <option value="fresh_on_ice">Fresh on Ice</option>
                          <option value="frozen">Frozen</option>
                          <option value="salted_dried">Salted/Dried</option>
                          <option value="live_holding">Live Holding</option>
                          <option value="other">Other</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                          <span className="text-gray-400">▼</span>
                        </div>
                      </div>
                    </div>

                    {/* Price per Kg */}
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Price per Kg (KSH)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <span className="text-gray-400 text-lg">💰</span>
                        </div>
                        <input
                          type="number"
                          name="pricePerKg"
                          value={formData.pricePerKg}
                          onChange={handleInputChange}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          className="w-full bg-gray-900/50 border border-gray-600 text-white pl-12 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 placeholder-gray-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Buyer */}
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Buyer (Optional)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-gray-400 text-lg">👤</span>
                      </div>
                      <input
                        type="text"
                        name="buyer"
                        value={formData.buyer}
                        onChange={handleInputChange}
                        placeholder="Buyer name or company"
                        className="w-full bg-gray-900/50 border border-gray-600 text-white pl-12 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 placeholder-gray-500"
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Notes (Optional)
                    </label>
                    <div className="relative">
                      <div className="absolute top-4 left-4 pointer-events-none">
                        <span className="text-gray-400 text-lg">📝</span>
                      </div>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="Additional notes about the catch..."
                        rows="4"
                        className="w-full bg-gray-900/50 border border-gray-600 text-white pl-12 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 placeholder-gray-500 resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg hover:scale-[1.02] flex items-center justify-center group"
                    >
                      <span className="mr-2 group-hover:-translate-x-1 transition-transform duration-300">←</span>
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={nextStep}
                      className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-[1.02] flex items-center justify-center group"
                    >
                      <span>Review Catch</span>
                      <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Review & Submit */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-700">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                      <span className="mr-2">📋</span>
                      Catch Summary
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Catch Type:</span>
                          <span className="text-white font-medium">{formData.catchType || 'Not specified'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Species:</span>
                          <span className="text-white font-medium">{formData.species || 'Not specified'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Volume:</span>
                          <span className="text-white font-medium">{formData.volume || 'Not specified'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Location:</span>
                          <span className="text-white font-medium">{formData.location || 'Not specified'}</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Date & Time:</span>
                          <span className="text-white font-medium">{formData.catchDate} at {formData.catchTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Storage:</span>
                          <span className="text-white font-medium">{formData.storageMethod || 'Not specified'}</span>
                        </div>
                        {formData.buyer && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Buyer:</span>
                            <span className="text-white font-medium">{formData.buyer}</span>
                          </div>
                        )}
                        {formData.pricePerKg && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Price per Kg:</span>
                            <span className="text-white font-medium">KSH {formData.pricePerKg}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {formData.notes && (
                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Notes:</span>
                          <span className="text-white font-medium text-right flex-1 ml-4">{formData.notes}</span>
                        </div>
                      </div>
                    )}

                    {imagePreview && (
                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <span className="text-gray-400 block mb-2">Catch Photo:</span>
                        <img
                          src={imagePreview}
                          alt="Catch preview"
                          className="w-32 h-32 object-cover rounded-xl border border-cyan-500/30"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg hover:scale-[1.02] flex items-center justify-center group"
                    >
                      <span className="mr-2 group-hover:-translate-x-1 transition-transform duration-300">←</span>
                      Edit Details
                    </button>
                    <button
                      type="submit"
                      disabled={isAnalyzingImage || !currentUser}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group"
                    >
                      {currentUser ? (
                        <>
                          <span>Log Catch</span>
                          <span className="ml-2 group-hover:scale-110 transition-transform duration-300">🎣</span>
                        </>
                      ) : (
                        'Please Login'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Add CSS for floating animation */}
      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.7;
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
            opacity: 1;
          }
          100% {
            transform: translateY(-40px) rotate(360deg);
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
};

export default DataFeed;