import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, Home, FileText, LogOut, Mail } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    const wasAdmin = user?.role === 'admin';
    await logout();
    navigate(wasAdmin ? '/admin/login' : '/');
    setIsMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = user ? (user.role === 'admin' ? [
    { path: '/admin/dashboard', label: 'Admin Dashboard', icon: Home },
  ] : [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/application', label: 'Application', icon: FileText },
    { path: '/contact', label: 'Contact', icon: Mail },
  ]) : [];

  // Hide global navbar on admin routes
  if (location.pathname.startsWith('/admin')) return null;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="mr-1">
              {/* Stylized palm tree logo to match Home */}
              <svg className="h-8 w-8" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-label="Palm Run logo">
                <path d="M34 28 C33 40 32 50 32 60 L28 60 C28 50 29 40 30 28 Z" fill="#8B5A2B"/>
                <path d="M29 34 H33 M28.8 38 H32.6 M28.6 42 H32.4 M28.4 46 H32.2 M28.2 50 H32" stroke="#A87444" strokeWidth="1.6" strokeLinecap="round"/>
                <circle cx="31" cy="28" r="2.2" fill="#6B4423"/>
                <circle cx="35" cy="27" r="2" fill="#6B4423"/>
                <path d="M32 20 C22 12, 13 15, 8 20 C16 20, 24 22, 32 24 Z" fill="#1E9E57"/>
                <path d="M32 20 C26 10, 20 10, 14 12 C20 14, 26 18, 32 22 Z" fill="#26B36A"/>
                <path d="M32 20 C42 12, 51 15, 56 20 C48 20, 40 22, 32 24 Z" fill="#1E9E57"/>
                <path d="M32 20 C38 10, 44 10, 50 12 C44 14, 38 18, 32 22 Z" fill="#26B36A"/>
                <path d="M32 20 C30 12, 32 8, 36 6 C34 10, 34 16, 32 20 Z" fill="#1E9E57"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900"><span className="text-blue-600">Palm</span> Run</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    isActive(link.path)
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu / Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Welcome, {user.firstName}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-primary-600 hover:bg-gray-50 transition-colors duration-200"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      isActive(link.path)
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
              
              {user && (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              )}
            </div>
            
            {!user && (
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-center btn-primary text-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
