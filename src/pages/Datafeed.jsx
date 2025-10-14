import React, { useState, useEffect } from 'react';
import { getDatabase, ref, push, set } from 'firebase/database';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { app } from '../firebase'; 

const DataFeed = () => {
  const navigate = useNavigate();
  const db = getDatabase(app);
  const { user: currentUser } = useAuth();

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

  // ✅ Local caching + connectivity
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

  // ✅ Auto-sync (future)
  useEffect(() => {
    if (isOnline && localCatches.length > 0) {
      console.log('Online, syncing local catches:', localCatches);
    }
  }, [isOnline, localCatches]);

  // ✅ Input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Convert image
  const convertImageToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  // ✅ Gemini analysis
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

  // ✅ Location
  const handleLocationClick = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported.');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setFormData((prev) => ({
          ...prev,
          location: `${coords.latitude}, ${coords.longitude}`,
        }));
      },
      () => alert('Could not get location.')
    );
  };

  // ✅ Local save fallback
  const saveCatchLocally = (data) => {
    const updated = [...localCatches, { 
      ...data, 
      fisherId: currentUser.uid,
      fisherEmail: currentUser.email 
    }];
    localStorage.setItem('localCatches', JSON.stringify(updated));
    setLocalCatches(updated);
  };

  // ✅ Submit to Firebase
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
        fisherId: currentUser.uid, // This should be f4c24XW6AGTu9pAMWr91jh9N0S23
        fisherEmail: currentUser.email,
        fisherName: currentUser.displayName || currentUser.email,
        createdAt: new Date().toISOString(),
      };

      // Debug: Log what we're about to send
      console.log('🚀 SENDING CATCH DATA:', catchData);

      await set(catchRef, catchData);

      alert('Catch logged successfully!');
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
    } catch (error) {
      console.error('Firebase error:', error);
      alert('Failed to log catch.');
    }
  };

  return (
    <div className="data-feed-container">
      <header>
        <h2>Log Your Catch</h2>
        {!isOnline && <p>Offline — will sync later</p>}
        {currentUser && (
          <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
            <p>You are logged in as: <strong>{currentUser.email}</strong></p>
            <p>User ID: <code>{currentUser.uid}</code></p>
            {currentUser.displayName && (
              <p>Display Name: {currentUser.displayName}</p>
            )}
          </div>
        )}
      </header>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Upload Catch Photo</label>
          <input type="file" accept="image/*" onChange={handleFileChange} disabled={isAnalyzingImage} />
          {isAnalyzingImage && <p>Analyzing image...</p>}
          {analysisError && <p style={{ color: 'red' }}>{analysisError}</p>}
        </div>

        <label>Catch Type</label>
        <select name="catchType" value={formData.catchType} onChange={handleInputChange} required>
          <option value="">Select</option>
          <option value="fish">Fish</option>
          <option value="crustacean">Crustacean</option>
          <option value="mollusk">Mollusk</option>
          <option value="aquatic_plant">Aquatic Plant</option>
          <option value="other">Other</option>
        </select>

        <label>Species</label>
        <input type="text" name="species" value={formData.species} onChange={handleInputChange} required />

        <label>Volume</label>
        <input type="text" name="volume" value={formData.volume} onChange={handleInputChange} required />

        <label>Location</label>
        <input type="text" name="location" value={formData.location} onChange={handleInputChange} required />
        <button type="button" onClick={handleLocationClick}>Get GPS</button>

        <label>Date</label>
        <input type="date" name="catchDate" value={formData.catchDate} onChange={handleInputChange} required />

        <label>Time</label>
        <input type="time" name="catchTime" value={formData.catchTime} onChange={handleInputChange} required />

        <label>Storage Method</label>
        <select name="storageMethod" value={formData.storageMethod} onChange={handleInputChange} required>
          <option value="">Select</option>
          <option value="fresh_on_ice">Fresh on Ice</option>
          <option value="frozen">Frozen</option>
          <option value="salted_dried">Salted/Dried</option>
          <option value="live_holding">Live Holding</option>
          <option value="other">Other</option>
        </select>

        <label>Buyer (Optional)</label>
        <input type="text" name="buyer" value={formData.buyer} onChange={handleInputChange} />

        <label>Price per Kg (KSH)</label>
        <input 
          type="number" 
          name="pricePerKg" 
          value={formData.pricePerKg} 
          onChange={handleInputChange}
          placeholder="Enter price per kilogram"
          min="0"
          step="0.01"
        />

        <label>Notes</label>
        <textarea name="notes" value={formData.notes} onChange={handleInputChange}></textarea>

        <div>
          <button 
            type="submit" 
            disabled={isAnalyzingImage || !currentUser}
          >
            {currentUser ? 'Log Catch' : 'Please Login'}
          </button>
          <button type="button" onClick={() => navigate('/dashboard/fisher')}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default DataFeed;