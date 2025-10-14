import React from "react";
import { Link, useLocation } from "react-router-dom";

function NavItem({ to, children }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={[
        "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
        isActive
          ? "text-white bg-white/10 ring-2 ring-white/20"
          : "text-sky-200 hover:text-white hover:bg-white/10",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-900/60 backdrop-blur">
      <div className="container mx-auto h-14 px-4 flex items-center justify-between">
        <Link to="/" className="text-white font-extrabold tracking-tight">
          BlueChain AI
        </Link>

        <div className="hidden md:flex items-center gap-2">
          <NavItem to="/">Home</NavItem>
          <NavItem to="/community">Community</NavItem>
          <NavItem to="/pricing">Pricing</NavItem>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="px-3 py-1.5 text-sm font-semibold text-white rounded-md border border-white/20 hover:bg-white/10"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="px-3 py-1.5 text-sm font-semibold text-slate-900 rounded-md bg-emerald-400 hover:bg-emerald-300"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
}