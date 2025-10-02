import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-semibold mb-2 text-blue-400">🌴 Palm Run</h3>
            <p className="text-gray-400 text-sm mb-4">
              Beachfront Condo Rental • Indian Shores, FL
            </p>
            <p className="text-gray-400 text-sm mb-4">
              Your trusted partner for beachfront living. 
              Experience luxury, comfort, and stunning ocean views.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link to="/" className="block text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                Home
              </Link>
              <Link to="/register" className="block text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                Apply Now
              </Link>
              <Link to="/login" className="block text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                Tenant Portal
              </Link>
              <Link to="/contact" className="block text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                Contact Us
              </Link>
              <Link to="/admin/login" className="block text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                Admin Login
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <a href="mailto:palmrunbeachcondo@gmail.com" className="text-gray-400 hover:text-white transition-colors duration-200">
                  palmrunbeachcondo@gmail.com
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <a href="tel:+14076871270" className="text-gray-400 hover:text-white transition-colors duration-200">
                  (407) 687-1270
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <a 
                  href="https://www.google.com/maps/dir/?api=1&destination=18650+Gulf+Blvd+Unit+207+Indian+Shores+FL+33785"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors duration-200 hover:underline"
                >
                  18650 Gulf Blvd Unit 207<br />
                  Indian Shores, FL 33785
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © {currentYear} Palm Run. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white transition-colors duration-200">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
