import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, LogOut, Settings, MessageSquare, Home, PlusCircle, Heart, CheckCircle, Briefcase, Bookmark } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/saved-jobs', icon: Bookmark, label: 'Saved Jobs' },
    { path: '/applied-jobs', icon: CheckCircle, label: 'Applied Jobs' },
    { path: '/post-job', icon: PlusCircle, label: 'Post Job' },
    { path: '/my-job-applications', icon: MessageSquare, label: 'View Applications' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-md shadow-lg'
          : 'bg-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <motion.div 
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Link to="/" className="flex-shrink-0 flex items-center">
              <div className="flex items-center space-x-2">
                <Briefcase className="h-8 w-8 text-primary-500" />
                <span className="text-2xl font-bold text-gray-900">SkillSetGo</span>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {navLinks.map((link) => (
              <motion.div
                key={link.path}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to={link.path}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                    isActive(link.path)
                      ? 'text-primary-500 bg-primary-50'
                      : 'text-gray-600 hover:text-primary-500 hover:bg-primary-50'
                  }`}
                >
                  <link.icon className="h-4 w-4 mr-1" />
                  {link.label}
                </Link>
              </motion.div>
            ))}
            
            {currentUser ? (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleProfile}
                  className="flex items-center space-x-2 text-gray-600 hover:text-primary-500 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:bg-primary-50"
                >
                  <User className="h-5 w-5" />
                  <span>{currentUser.displayName || 'Profile'}</span>
                </motion.button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-gray-200 ring-opacity-5"
                    >
                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-primary-50 hover:text-primary-500 transition-all duration-300"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <User className="h-4 w-4 mr-2" />
                          Profile
                        </Link>
                        <Link
                          to="/messages"
                          className="flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-primary-50 hover:text-primary-500 transition-all duration-300"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Messages
                        </Link>
                        <Link
                          to="/settings"
                          className="flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-primary-50 hover:text-primary-500 transition-all duration-300"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </Link>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-600 hover:bg-primary-50 hover:text-primary-500 transition-all duration-300"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/signin">
                  <Button variant="ghost" className="text-gray-600 hover:text-primary-500 transition-all duration-300">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-primary-500 hover:bg-primary-600 text-white transition-all duration-300 shadow-md hover:shadow-lg">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-primary-500 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-all duration-300"
            >
              {isOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white shadow-lg"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <motion.div
                  key={link.path}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    to={link.path}
                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-all duration-300 ${
                      isActive(link.path)
                        ? 'text-primary-500 bg-primary-50'
                        : 'text-gray-600 hover:text-primary-500 hover:bg-primary-50'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <link.icon className="h-5 w-5 mr-2" />
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              
              {currentUser ? (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary-500 hover:bg-primary-50 transition-all duration-300"
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="h-5 w-5 mr-2" />
                    Profile
                  </Link>
                  <Link
                    to="/messages"
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary-500 hover:bg-primary-50 transition-all duration-300"
                    onClick={() => setIsOpen(false)}
                  >
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Messages
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary-500 hover:bg-primary-50 transition-all duration-300"
                    onClick={() => setIsOpen(false)}
                  >
                    <Settings className="h-5 w-5 mr-2" />
                    Settings
                  </Link>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary-500 hover:bg-primary-50 transition-all duration-300"
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    Sign Out
                  </motion.button>
                </>
              ) : (
                <>
                  <Link
                    to="/signin"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary-500 hover:bg-primary-50 transition-all duration-300"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary-500 hover:bg-primary-50 transition-all duration-300"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
} 