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
        setWeatherError("No weather API key configured (VITE_WEATHER_API_KEY). Please set it in .env.local and restart the dev server.");
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

  return (
    <div className="dashboard-page">
      <aside className="sidebar">
        <div className="sidebar-brand">BlueChain AI</div>
        <nav className="sidebar-nav">
          <ul>
            <li>
              <button className="nav-link" onClick={() => navigate('/dashboard')}>Home</button>
            </li>
            <li>
              <button className="nav-link" onClick={() => navigate('/community')}>Community</button>
            </li>
            <li>
              <button className="nav-link" onClick={() => navigate('/microloans')}>Microloans</button>
            </li>
            <li>
              <button className="nav-link" onClick={() => navigate('/business')}>My Business</button>
            </li>
            <li>
              <button className="nav-link" onClick={() => navigate('/profile')}>My Profile</button>
            </li>
            <li>
              <button className="nav-link" onClick={() => navigate('/premium')}>Advanced AI (Premium)</button>
            </li>
            <li>
              <button className="nav-link" onClick={() => navigate('/data-feed')}>Data Feed</button>
            </li>
          </ul>
        </nav>
      </aside>

      <main className="main-content">
        <header className="dashboard-header">
          <div className="dashboard-title">
            <h2>Welcome, {user?.fullName || user?.email}</h2>
            <p className="dashboard-subtitle">Your BlueChain AI dashboard</p>
          </div>
          <div className="dashboard-actions">
            <button className="logout-btn" onClick={logout}>Logout</button>
          </div>
        </header>

        <section className="dashboard-grid">
          <div className="grid-left">
            <article className="card big-card ai-suggestion">
              <h3>AI Top Suggestion</h3>
              <p className="card-lead">This is the primary AI recommendation based on recent catches, credit scoring signals, and marketplace trends.</p>
              <div className="card-content">
                <p>Brief summary of the AI suggestion goes here. Use this space to show the most important action item.</p>
              </div>
            </article>

            <div className="card-row">
              <article className="card weather-card">
                <h4>Weather Reports</h4>
                <div className="weather-controls">
                  <label htmlFor="coastal-location">Location:</label>
                  <select id="coastal-location" value={selectedLocation || ""} onChange={(e) => handleLocationChange(e.target.value)}>
                    {coastalLocations.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {weatherError ? (
                  <div className="weather-error">{weatherError}</div>
                ) : weather ? (
                  <ul>
                    <li>Location: {weather.city}</li>
                    <li>Condition: {weather.condition}</li>
                    <li>Temperature: {weather.temp} °C</li>
                    <li>Wind: {weather.wind} m/s</li>
                  </ul>
                ) : (
                  <div>Loading weather...</div>
                )}
              </article>

              <article className="card market-card">
                <h4>Fish Market Prices</h4>
                <ul>
                  <li>Tilapia: -- / kg</li>
                  <li>Mackerel: -- / kg</li>
                  <li>Sardines: -- / kg</li>
                </ul>
              </article>
            </div>
          </div>

          <aside className="grid-right">
            <article className="card demand-card">
              <h4>Fish Demand Insights</h4>
              <p>Demand signals by species and other factors (seasonality, price, buyer interest).</p>
              <ul>
                <li>Species: Tilapia — Demand: --</li>
                <li>Species: Mackerel — Demand: --</li>
                <li>Species: Sardines — Demand: --</li>
              </ul>
            </article>

            <article className="card small-card">
              <h4>Quick Actions</h4>
              <ul>
                <li><button className="action-btn">Request Loan</button></li>
                <li><button className="action-btn">Log Catch</button></li>
                <li><button className="action-btn">Share to Community</button></li>
              </ul>
            </article>
          </aside>
        </section>

        <section className="dashboard-bottom">
          <article className="card insights-card">
            <h4>More Insights</h4>
            <p>Additional analytics, charts, or data feeds can be placed here.</p>
          </article>
        </section>
      </main>
    </div>
  );
}
