import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center text-2xl font-bold text-gray-900">
                <div className="mr-2">
                  <svg className="h-8 w-8" viewBox="0 0 32 32" fill="none">
                    {/* Palm tree trunk (brown) */}
                    <rect x="14" y="20" width="4" height="12" fill="#8B4513" rx="2"/>
                    {/* Curved palm tree leaves (green) */}
                    <path d="M16 4 Q8 12 12 18 Q16 14 20 18 Q24 12 16 4" fill="#228B22"/>
                    <path d="M16 6 Q6 14 10 20 Q16 16 22 20 Q26 14 16 6" fill="#32CD32"/>
                    <path d="M16 8 Q4 16 8 22 Q16 18 24 22 Q28 16 16 8" fill="#228B22"/>
                    <path d="M16 2 Q10 8 12 14 Q16 10 20 14 Q22 8 16 2" fill="#32CD32"/>
                    <path d="M16 3 Q12 6 14 12 Q16 8 18 12 Q20 6 16 3" fill="#228B22"/>
                  </svg>
                </div>
                <span className="text-blue-600">Palm</span> Run
              </Link>
            </div>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link 
                to="/" 
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  isActive('/') 
                    ? 'text-blue-600' 
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Home
              </Link>
              <Link 
                to="/register" 
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  isActive('/register') 
                    ? 'text-blue-600' 
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Apply
              </Link>
              <Link 
                to="/login" 
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  isActive('/login') 
                    ? 'text-blue-600' 
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Login
              </Link>
              <Link 
                to="/contact" 
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  isActive('/contact') 
                    ? 'text-blue-600' 
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Contact
              </Link>
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-600 hover:text-gray-900 p-2"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link 
              to="/" 
              className={`block px-3 py-2 transition-colors ${
                isActive('/') 
                  ? 'text-blue-600' 
                  : 'text-gray-900 hover:text-blue-600'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/register" 
              className={`block px-3 py-2 transition-colors ${
                isActive('/register') 
                  ? 'text-blue-600' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Apply
            </Link>
            <Link 
              to="/login" 
              className={`block px-3 py-2 transition-colors ${
                isActive('/login') 
                  ? 'text-blue-600' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Login
            </Link>
            <Link 
              to="/contact" 
              className={`block px-3 py-2 transition-colors ${
                isActive('/contact') 
                  ? 'text-blue-600' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
