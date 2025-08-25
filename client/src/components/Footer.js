import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-gray-400 text-sm">
            © {currentYear} Palm Run LLC. All rights reserved.
          </div>
          <div className="flex space-x-6 text-sm">
            <Link to="/" className="text-gray-400 hover:text-white transition-colors duration-200">
              Home
            </Link>
            <Link to="/register" className="text-gray-400 hover:text-white transition-colors duration-200">
              Apply Now
            </Link>
            <Link to="/login" className="text-gray-400 hover:text-white transition-colors duration-200">
              Tenant Portal
            </Link>
            <Link to="/admin/login" className="text-gray-400 hover:text-white transition-colors duration-200">
              Admin
            </Link>
            <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors duration-200">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-400 hover:text-white transition-colors duration-200">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
