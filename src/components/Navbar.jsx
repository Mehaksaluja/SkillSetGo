import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { Menu, X, User, LogOut, Settings, MessageSquare, Home, PlusCircle, Heart, CheckCircle, Briefcase, Bookmark } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);

  return (
    <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <div className="flex items-center space-x-2">
                <Briefcase className="h-8 w-8 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">SkillSetGo</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link to="/" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 flex items-center hover:bg-blue-50">
              <Home className="h-4 w-4 mr-1" />
              Home
            </Link>
            <Link to="/saved-jobs" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 flex items-center hover:bg-blue-50">
              <Bookmark className="h-4 w-4 mr-1" />
              Saved Jobs
            </Link>
            <Link to="/applied-jobs" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 flex items-center hover:bg-blue-50">
              <CheckCircle className="h-4 w-4 mr-1" />
              Applied Jobs
            </Link>
            <Link to="/post-job" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 flex items-center hover:bg-blue-50">
              <PlusCircle className="h-4 w-4 mr-1" />
              Post Job
            </Link>
            <Link to="/my-job-applications" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 flex items-center hover:bg-blue-50">
              <MessageSquare className="h-4 w-4 mr-1" />
              View Applications
            </Link>
            
            {currentUser ? (
              <>
                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={toggleProfile}
                    className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:bg-blue-50"
                  >
                    <User className="h-5 w-5" />
                    <span>{currentUser.displayName || 'Profile'}</span>
                  </button>

                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-gray-200 ring-opacity-5"
                    >
                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-300"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <User className="h-4 w-4 mr-2" />
                          Profile
                        </Link>
                        <Link
                          to="/messages"
                          className="flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-300"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Messages
                        </Link>
                        <Link
                          to="/settings"
                          className="flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-300"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-300"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/signin">
                  <Button variant="ghost" className="text-gray-600 hover:text-blue-600 transition-all duration-300">Sign In</Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 shadow-md hover:shadow-lg">Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all duration-300"
            >
              {isOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="md:hidden"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg">
            <Link
              to="/"
              className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300"
              onClick={() => setIsOpen(false)}
            >
              <Home className="h-5 w-5 mr-2" />
              Home
            </Link>
            <Link
              to="/saved-jobs"
              className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300"
              onClick={() => setIsOpen(false)}
            >
              <Bookmark className="h-5 w-5 mr-2" />
              Saved Jobs
            </Link>
            <Link
              to="/applied-jobs"
              className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300"
              onClick={() => setIsOpen(false)}
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              Applied Jobs
            </Link>
            <Link
              to="/post-job"
              className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300"
              onClick={() => setIsOpen(false)}
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Post Job
            </Link>
            <Link
              to="/my-job-applications"
              className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300"
              onClick={() => setIsOpen(false)}
            >
              <MessageSquare className="h-5 w-5 mr-2" />
              View Applications
            </Link>
            
            {currentUser ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300"
                  onClick={() => setIsOpen(false)}
                >
                  <User className="h-5 w-5 mr-2" />
                  Profile
                </Link>
                <Link
                  to="/messages"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300"
                  onClick={() => setIsOpen(false)}
                >
                  Messages
                </Link>
                <Link
                  to="/settings"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300"
                  onClick={() => setIsOpen(false)}
                >
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300"
                  onClick={() => setIsOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300"
                  onClick={() => setIsOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
} 