import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { Search, Briefcase, Users, Heart, MapPin, Accessibility, GraduationCap, Sparkles } from 'lucide-react';
import teamworkImage from '@/assets/teamwork.jpg';

export default function HomeGuest() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="text-center max-w-3xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl md:text-6xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight"
          >
            Empowering Women, Youth & People with Disabilities
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 md:mb-8 px-4"
          >
            Find inclusive local opportunities that value your unique strengths and support your growth
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center px-4"
          >
            <Link to="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full text-base sm:text-lg">
                Start Your Journey
              </Button>
            </Link>
            <Link to="/signin" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full text-base sm:text-lg">
                Sign In
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">Why Choose SkillSetGo?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="p-6 rounded-lg bg-gray-50 hover:shadow-lg transition-shadow duration-300"
            >
              <Accessibility className="w-10 h-10 md:w-12 md:h-12 text-blue-600 mb-4" />
              <h3 className="text-lg md:text-xl font-semibold mb-2">Inclusive Environment</h3>
              <p className="text-gray-600 text-sm md:text-base">Find workplaces that are accessible and supportive of your needs</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 rounded-lg bg-gray-50 hover:shadow-lg transition-shadow duration-300"
            >
              <GraduationCap className="w-10 h-10 md:w-12 md:h-12 text-blue-600 mb-4" />
              <h3 className="text-lg md:text-xl font-semibold mb-2">Youth Opportunities</h3>
              <p className="text-gray-600 text-sm md:text-base">Access entry-level positions and internships perfect for young professionals</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-6 rounded-lg bg-gray-50 hover:shadow-lg transition-shadow duration-300"
            >
              <Sparkles className="w-10 h-10 md:w-12 md:h-12 text-blue-600 mb-4" />
              <h3 className="text-lg md:text-xl font-semibold mb-2">Women-Friendly</h3>
              <p className="text-gray-600 text-sm md:text-base">Connect with employers committed to gender equality and women's empowerment</p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Your Success is Our Priority</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Local Opportunities</h3>
                  <p className="text-sm sm:text-base text-gray-600">Find work close to home with detailed accessibility information</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Supportive Community</h3>
                  <p className="text-sm sm:text-base text-gray-600">Connect with employers who understand and value diversity</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Flexible Work Options</h3>
                  <p className="text-sm sm:text-base text-gray-600">Find jobs that accommodate your schedule and needs</p>
                </div>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="relative max-w-lg mx-auto md:mx-0"
          >
            <div className="aspect-w-4 aspect-h-3 rounded-lg overflow-hidden shadow-xl">
              <img
                src={teamworkImage}
                alt="Diverse team working together"
                className="object-cover w-full h-full"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
              Take the First Step Towards Your Future
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Join a community where your potential is recognized and your growth is supported. Your journey to success starts here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4 px-4">
              <Link to="/signup" className="w-full sm:w-auto">
                <Button size="lg" className="w-full text-base sm:text-lg bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                  Begin Your Journey
                </Button>
              </Link>
              <Link to="/signin" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full text-base sm:text-lg border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-6 sm:px-8 py-3 rounded-lg transition-all duration-300">
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 