import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, Home, LogOut, BarChart3, Settings, DollarSign, Calendar } from 'lucide-react';
import AdminPasswordChange from './AdminPasswordChange';

const AdminNavbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
    setIsMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const adminNavLinks = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: Home },
    { path: '/admin/revenue', label: 'Revenue', icon: BarChart3 },
    { path: '/admin/rates', label: 'Rates', icon: DollarSign },
    { path: '/admin/availability', label: 'Availability', icon: Calendar },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/admin/dashboard" className="flex items-center text-2xl font-bold text-gray-900">
              <div className="mr-2">
                {/* Stylized palm tree logo */}
                <svg className="h-8 w-8" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-label="Palm Run logo">
                  {/* Trunk */}
                  <path d="M34 28 C33 40 32 50 32 60 L28 60 C28 50 29 40 30 28 Z" fill="#8B5A2B"/>
                  {/* Trunk rings */}
                  <path d="M29 34 H33 M28.8 38 H32.6 M28.6 42 H32.4 M28.4 46 H32.2 M28.2 50 H32" stroke="#A87444" strokeWidth="1.6" strokeLinecap="round"/>
                  {/* Coconuts */}
                  <circle cx="31" cy="28" r="2.2" fill="#6B4423"/>
                  <circle cx="35" cy="27" r="2" fill="#6B4423"/>
                  {/* Leaves (fronds) */}
                  <path d="M32 20 C22 12, 13 15, 8 20 C16 20, 24 22, 32 24 Z" fill="#1E9E57"/>
                  <path d="M32 20 C26 10, 20 10, 14 12 C20 14, 26 18, 32 22 Z" fill="#26B36A"/>
                  <path d="M32 20 C42 12, 51 15, 56 20 C48 20, 40 22, 32 24 Z" fill="#1E9E57"/>
                  <path d="M32 20 C38 10, 44 10, 50 12 C44 14, 38 18, 32 22 Z" fill="#26B36A"/>
                  <path d="M32 20 C30 12, 32 8, 36 6 C34 10, 34 16, 32 20 Z" fill="#1E9E57"/>
                </svg>
              </div>
              <span className="text-blue-600">Palm</span> Run <span className="text-sm text-gray-500 ml-2">Admin</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {adminNavLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive(link.path)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
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
                  Welcome, {user.firstName || user.email}
                </span>
                <button
                  onClick={() => setShowPasswordChange(true)}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                  title="Change Password"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/admin/login"
                className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                Admin Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors duration-200"
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
              {adminNavLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                      isActive(link.path)
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
              
              {/* Mobile User Menu */}
              {user ? (
                <div className="pt-4 border-t border-gray-200">
                  <div className="px-3 py-2 text-sm text-gray-600">
                    Welcome, {user.firstName || user.email}
                  </div>
                  <button
                    onClick={() => {
                      setShowPasswordChange(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-3 w-full px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Change Password</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 w-full px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-200">
                  <Link
                    to="/admin/login"
                    className="block px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Admin Login
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Password Change Modal */}
      {showPasswordChange && (
        <AdminPasswordChange onClose={() => setShowPasswordChange(false)} />
      )}
    </nav>
  );
};

export default AdminNavbar;
