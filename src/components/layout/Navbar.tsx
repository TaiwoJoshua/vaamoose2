import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Bus, MapPin, HelpCircle, User, ChevronDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

interface NavbarProps {
  onNavigate: (view: 'landing' | 'booking' | 'tracking' | 'profile' | 'partner-login' | 'partner-dashboard' | 'booking-history' | 'search') => void;
  onLoginClick: () => void;
  onPartnerClick: () => void;
  onSearchClick: () => void;
}

const navLinks = [
  { id: 'how-it-works', label: 'How It Works', icon: Bus },
  { id: 'partners', label: 'Partners', icon: MapPin },
  { id: 'tracking', label: 'Track Ride', icon: MapPin },
  { id: 'support', label: 'Support', icon: HelpCircle },
];

export function Navbar({ onNavigate, onLoginClick, onPartnerClick, onSearchClick }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => onNavigate('landing')}
            whileHover={{ scale: 1.02 }}
          >
            <img
              src="/vaamoose-logo.jpg"
              alt="Vaamoose"
              className="h-8 w-auto"
            />
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  if (link.id === 'tracking') {
                    onNavigate('tracking');
                  } else {
                    const element = document.getElementById(link.id);
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="text-slate-600 hover:text-blue-600 font-medium transition-colors"
              >
                {link.label}
              </button>
            ))}

            {/* Search Button */}
            <button
              onClick={onSearchClick}
              className="text-slate-500 hover:text-blue-600 font-medium transition-colors text-sm border border-slate-200 px-3 py-1.5 rounded-lg hover:border-blue-400 flex items-center gap-1"
            >
              <Search className="w-4 h-4" />
              Search Rides
            </button>

            {/* Partner Portal */}
            <button
              onClick={onPartnerClick}
              className="text-slate-500 hover:text-blue-600 font-medium transition-colors text-sm border border-slate-200 px-3 py-1.5 rounded-lg hover:border-blue-400"
            >
              Partner Portal
            </button>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.fullName?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden sm:block text-slate-700 font-medium">{user?.fullName}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                <AnimatePresence>
                  {showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-2"
                    >
                      <button
                        onClick={() => {
                          onNavigate('profile');
                          setShowDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <User className="w-4 h-4" />
                        My Profile
                      </button>
                      <button
                        onClick={() => {
                          onNavigate('booking-history');
                          setShowDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <MapPin className="w-4 h-4" />
                        My Bookings
                      </button>
                      <button
                        onClick={() => {
                          onSearchClick();
                          setShowDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Search className="w-4 h-4" />
                        Search Rides
                      </button>
                      <hr className="my-2 border-slate-100" />
                      <button
                        onClick={() => {
                          logout();
                          setShowDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50"
                      >
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-3">
                <Button
                  variant="ghost"
                  onClick={onLoginClick}
                  className="text-slate-600 hover:text-blue-600"
                >
                  Sign In
                </Button>
                <Button
                  onClick={onLoginClick}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Get Started
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-slate-100"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => {
                    if (link.id === 'tracking') {
                      onNavigate('tracking');
                    } else {
                      const element = document.getElementById(link.id);
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 text-left text-slate-700 hover:bg-slate-50 rounded-lg font-medium"
                >
                  {link.label}
                </button>
              ))}
              <hr className="my-2 border-slate-100" />
              <button
                onClick={() => {
                  onSearchClick();
                  setIsMenuOpen(false);
                }}
                className="w-full px-4 py-3 text-left text-slate-600 hover:bg-slate-50 rounded-lg font-medium flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Search Rides
              </button>
              <button
                onClick={() => {
                  onPartnerClick();
                  setIsMenuOpen(false);
                }}
                className="w-full px-4 py-3 text-left text-slate-600 hover:bg-slate-50 rounded-lg font-medium"
              >
                Partner Portal
              </button>
              {!isAuthenticated && (
                <Button
                  onClick={() => {
                    onLoginClick();
                    setIsMenuOpen(false);
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Get Started
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}