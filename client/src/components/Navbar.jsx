import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Leaf, ClipboardList, Search, Lock } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: 'Buat Laporan', path: '/', icon: <ClipboardList className="w-5 h-5" /> },
    { name: 'Cek Status', path: '/status', icon: <Search className="w-5 h-5" /> },
  ];

  return (
    <nav className="bg-emerald-600 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2 font-bold text-xl tracking-tight hover:text-emerald-100 transition">
              <div className="p-2 bg-white/10 rounded-full">
                <Leaf className="w-6 h-6" />
              </div>
              <span>SmartEnv</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'text-emerald-100 hover:bg-emerald-500 hover:text-white'
                }`}
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            ))}
            
            {/* Admin Button (Distinct Style) */}
            <Link
              to="/admin/login"
              className="flex items-center space-x-1 px-4 py-2 border border-emerald-200 rounded-lg text-sm font-medium hover:bg-white hover:text-emerald-700 transition-all ml-2"
            >
              <Lock className="w-4 h-4" />
              <span>Admin</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md hover:bg-emerald-500 focus:outline-none transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div className={`md:hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 bg-emerald-700 shadow-inner">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-3 rounded-md text-base font-medium flex items-center space-x-3 ${
                isActive(link.path)
                  ? 'bg-emerald-800 text-white'
                  : 'text-emerald-100 hover:bg-emerald-600 hover:text-white'
              }`}
            >
              {link.icon}
              <span>{link.name}</span>
            </Link>
          ))}
          <Link
            to="/admin/login"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-3 rounded-md text-base font-medium text-emerald-100 hover:bg-emerald-600 hover:text-white flex items-center space-x-3 border-t border-emerald-600 mt-2 pt-3"
          >
            <Lock className="w-5 h-5" />
            <span>Admin Portal</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
