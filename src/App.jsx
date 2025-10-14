import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignUp from "./pages/Auth/SignUp";
import Login from "./pages/Auth/Login";
import Landing from "./pages/Landing";
import FisherDashboard from "./pages/Dashboard/FisherDashboard";
import Community from "./pages/Community";
import BuyerDashboard from "./pages/Dashboard/BuyerDashboard";
import CreditDashboard from "./pages/Dashboard/CreditDashboard"; 
import Profile from "./pages/Dashboard/Profile";
import DataFeed from "./pages/Datafeed";
import Microloans from "./pages/Dashboard/Microloans"; 
import ProtectedRoute from "./components/ProtectedRoute";
import AuthGuard from "./components/AuthGuard";
import Pricing from "./pages/Pricing";
import Business from "./pages/Dashboard/Business";
import Navbar from "./components/Navbar";

export default function App() {
  return (
    <BrowserRouter>
      <AuthGuard />
      <Routes>
  <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <FisherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/buyer-dashboard"
          element={
            <ProtectedRoute>
              <BuyerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/community"
          element={
            <ProtectedRoute>
              <Community />
            </ProtectedRoute>
          }
        />
        <Route
          path="/data-feed"
          element={
            <ProtectedRoute>
              <DataFeed />
            </ProtectedRoute>
          }
        />
        <Route
          path="/credit-dashboard"
          element={
            <ProtectedRoute>
              <CreditDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/microloans"
          element={
            <ProtectedRoute>
              <Microloans />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/business"
          element={
            <ProtectedRoute>
              <Business />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pricing"
          element={
            <ProtectedRoute>
              <Pricing />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
