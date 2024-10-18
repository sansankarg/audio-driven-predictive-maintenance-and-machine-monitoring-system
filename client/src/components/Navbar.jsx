import React from "react";
import '../CSS/Navbar.css';
import '../CSS/Profile.css';
import { useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthContext";
import Profile from "./Profile";
import { Link, Outlet } from "react-router-dom";

var Navbar = () => {
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);
  const { username } = useAuth();

  const toggleProfile = () => {
    setShowProfile(!showProfile);
  };

  const handleClickOutside = (event) => {
    if (profileRef.current && !profileRef.current.contains(event.target)) {
      setShowProfile(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const initial = username ? username.charAt(0).toUpperCase() : "";

  return (
    <div>
      <nav className="navbar navbar-expand-sm">
        {/* Brand aligned to the left */}
        <a className="navbar-brand" href="/home">SoundAnalysis</a>
        
        {/* Links aligned to the right */}
        <ul className="navbar-nav">
          <li className="nav-item"><Link className="nav-link" to="/industry">Industry</Link></li>
          <li className="nav-item"><Link className="nav-link" to="/industry/dashboard">Dashboard</Link></li>
          <li className="nav-item"><Link className="nav-link" to="/industry/notification">Notification</Link></li>
          <li className="nav-item">
            <div className="profile-icon" onClick={toggleProfile}>{initial}</div>
            {showProfile && (
              <div ref={profileRef} className="profile-card">
                <Profile />
              </div>
            )}
          </li>
        </ul>
      </nav>
      <Outlet />
    </div>
  );
};

export default Navbar;