import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { LOGOUT } from '../constants/actionTypes';
import { Menu, X, Home, PenSquare, Settings, LogOut, User } from 'lucide-react';

// Fallback Avatar Component
export const Avatar = ({ src, alt, size = "w-8 h-8", textClass = "text-sm" }) => {
  const defaultImage = 'https://static.productionready.io/images/smiley-cyrus.jpg';
  const isDefaultOrMissing = !src || src === defaultImage;
  const initial = alt ? alt.charAt(0).toUpperCase() : '?';

  if (isDefaultOrMissing) {
    return (
      <div className={`${size} rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold ${textClass} shrink-0`}>
        {initial}
      </div>
    );
  }
  return <img src={src} alt={alt} className={`${size} rounded-full object-cover border border-gray-200 shrink-0`} />;
};

const Header = ({ appName, currentUser }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = (e) => {
    e.preventDefault();
    dispatch({ type: LOGOUT });
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-black text-indigo-600 tracking-tighter hover:text-indigo-700 transition-colors">
              {appName.toUpperCase()}
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            <Link to="/" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md font-medium flex items-center gap-2 transition-colors">
              <Home size={18} /> Home
            </Link>

            {!currentUser && (
              <>
                <Link to="/login" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Sign in</Link>
                <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm">Sign up</Link>
              </>
            )}

            {currentUser && (
              <>
                <Link to="/editor" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md font-medium flex items-center gap-2 transition-colors">
                  <PenSquare size={18} /> New Post
                </Link>

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 pl-3 py-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
                  >
                    <Avatar src={currentUser.image} alt={currentUser.username} size="w-9 h-9" />
                    <span className="font-semibold text-gray-700">{currentUser.username}</span>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-1 border border-gray-100 transform opacity-100 scale-100 transition-all origin-top-right">
                      <Link to={`/@${currentUser.username}`} onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700">
                        <User size={16} /> Profile
                      </Link>
                      <Link to="/settings" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700">
                        <Settings size={16} /> Settings
                      </Link>
                      <div className="h-px bg-gray-100 my-1"></div>
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 font-medium text-left">
                        <LogOut size={16} /> Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-600 hover:text-indigo-600 focus:outline-none p-2">
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-inner px-4 pt-2 pb-6 space-y-2">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-3 rounded-lg font-medium">
            <Home size={20} /> Home
          </Link>

          {!currentUser ? (
            <>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-3 rounded-lg font-medium">Sign in</Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block text-indigo-600 bg-indigo-50 px-3 py-3 rounded-lg font-bold">Sign up</Link>
            </>
          ) : (
            <>
              <Link to="/editor" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-3 rounded-lg font-medium">
                <PenSquare size={20} /> New Post
              </Link>
              <Link to={`/@${currentUser.username}`} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-3 rounded-lg font-medium">
                <User size={20} /> Profile
              </Link>
              <Link to="/settings" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-3 rounded-lg font-medium">
                <Settings size={20} /> Settings
              </Link>
              <button onClick={handleLogout} className="w-full flex items-center gap-3 text-red-600 hover:bg-red-50 px-3 py-3 rounded-lg font-medium text-left">
                <LogOut size={20} /> Sign out
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Header;