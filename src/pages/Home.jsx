import { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { JobFilters } from '@/components/JobFilters';
import { JobRecommendations } from '@/components/JobRecommendations';
import { useJobs } from '@/context/JobContext';
import { useAuth } from '@/context/AuthContext';
import { Search, Heart, MapPin, X, Filter, Briefcase, Clock, DollarSign, Globe, Trash2, Edit2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, where, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { useToaster } from '@/components/ui/Toaster';
import HomeGuest from '@/components/HomeGuest';

// FilterSection Component
function FilterSection({ title, options, category, selectedFilters, onFilterChange }) {
  if (!options || !Array.isArray(options)) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-medium text-gray-900">{title}</h3>
      <div className="space-y-2">
        {options.map((option) => (
          <div key={option} className="flex items-center justify-between">
            <label className="text-sm text-gray-600">{option}</label>
            <Switch
              checked={selectedFilters?.includes(option)}
              onCheckedChange={() => onFilterChange(category, option)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { deleteJob } = useJobs();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({
    jobType: [],
    salaryRange: [],
    accessibility: [],
    suitableFor: [],
    distance: []
  });
  const { addToast } = useToaster();

  // If user is not authenticated, show the guest home page
  if (!currentUser) {
    return <HomeGuest />;
  }

  const filterOptions = {
    jobType: ["Full-time", "Part-time", "Contract", "Freelance"],
    salaryRange: [
      "Under ₹10,000",
      "₹10,000 - ₹20,000",
      "₹20,000 - ₹30,000",
      "Above ₹30,000"
    ],
    accessibility: [
      "Wheelchair Accessible",
      "Work from Home Option",
      "Outdoor Work"
    ],
    suitableFor: [
      "Women",
      "People with Disabilities",
      "All"
    ],
    distance: [
      "Within 2 km",
      "2-5 km",
      "5-10 km",
      "Above 10 km"
    ]
  };

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setIsLoading(true);
        const jobsQuery = query(
          collection(db, 'jobs'),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(jobsQuery);
        const jobsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setJobs(jobsData);
        setFilteredJobs(jobsData);
      } catch (error) {
        console.error('Error loading jobs:', error);
        addToast('Failed to load jobs', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    loadJobs();

    // Load saved jobs if user is logged in
    if (currentUser) {
      const loadSavedJobs = async () => {
        try {
          const savedJobsQuery = query(
            collection(db, 'savedJobs'),
            where('userId', '==', currentUser.uid)
          );
          const savedJobsSnapshot = await getDocs(savedJobsQuery);
          const savedJobIds = savedJobsSnapshot.docs.map(doc => doc.data().jobId);
          setSavedJobs(savedJobIds);
        } catch (error) {
          console.error('Error loading saved jobs:', error);
        }
      };
      loadSavedJobs();
    }
  }, [currentUser, addToast]);

  useEffect(() => {
    // Apply filters and search
    let result = [...jobs];

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(job => 
        job.title.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query)
      );
    }

    // Apply filters
    if (selectedFilters.jobType.length > 0) {
      result = result.filter(job => selectedFilters.jobType.includes(job.type));
    }

    if (selectedFilters.salaryRange.length > 0) {
      result = result.filter(job => {
        const price = parseInt(job.price.replace(/[^0-9]/g, ''));
        return selectedFilters.salaryRange.some(range => {
          if (range === "Under ₹10,000") return price < 10000;
          if (range === "₹10,000 - ₹20,000") return price >= 10000 && price <= 20000;
          if (range === "₹20,000 - ₹30,000") return price >= 20000 && price <= 30000;
          if (range === "Above ₹30,000") return price > 30000;
          return true;
        });
      });
    }

    if (selectedFilters.accessibility.length > 0) {
      result = result.filter(job => 
        job.accessibility?.some(acc => selectedFilters.accessibility.includes(acc))
      );
    }

    if (selectedFilters.suitableFor.length > 0) {
      result = result.filter(job => 
        job.suitableFor?.some(suit => selectedFilters.suitableFor.includes(suit))
      );
    }

    if (selectedFilters.distance.length > 0) {
      result = result.filter(job => {
        const distance = parseFloat(job.distance);
        return selectedFilters.distance.some(range => {
          if (range === "Within 2 km") return distance <= 2;
          if (range === "2-5 km") return distance > 2 && distance <= 5;
          if (range === "5-10 km") return distance > 5 && distance <= 10;
          if (range === "Above 10 km") return distance > 10;
          return true;
        });
      });
    }

    setFilteredJobs(result);
  }, [jobs, searchQuery, selectedFilters]);

  const handleFilterChange = (category, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(item => item !== value)
        : [...prev[category], value]
    }));
  };

  const handleClearFilters = () => {
    setSelectedFilters({
      jobType: [],
      salaryRange: [],
      accessibility: [],
      suitableFor: [],
      distance: []
    });
    setSearchQuery('');
  };

  const toggleSaveJob = async (jobId) => {
    if (!currentUser) {
      navigate('/signin');
      return;
    }

    try {
      const savedJobsQuery = query(
        collection(db, 'savedJobs'),
        where('userId', '==', currentUser.uid),
        where('jobId', '==', jobId)
      );
      const savedJobsSnapshot = await getDocs(savedJobsQuery);

      if (savedJobsSnapshot.empty) {
        // Save the job
        await addDoc(collection(db, 'savedJobs'), {
          userId: currentUser.uid,
          jobId: jobId,
          savedAt: new Date()
        });
        setSavedJobs(prev => [...prev, jobId]);
        addToast('Job saved successfully', 'success');
      } else {
        // Unsave the job
        const savedJobDoc = savedJobsSnapshot.docs[0];
        await deleteDoc(doc(db, 'savedJobs', savedJobDoc.id));
        setSavedJobs(prev => prev.filter(id => id !== jobId));
        addToast('Job removed from saved jobs', 'success');
      }
    } catch (error) {
      console.error('Error toggling saved job:', error);
      addToast('Failed to update saved job', 'error');
    }
  };

  const handleJobClick = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  const handleClearAllJobs = async () => {
    if (window.confirm('Are you sure you want to delete all jobs? This action cannot be undone.')) {
      try {
        const success = clearAllJobs();
        if (success) {
          setJobs([]);
          addToast('All jobs have been cleared', 'success');
        } else {
          addToast('Failed to clear jobs', 'error');
        }
      } catch (error) {
        console.error('Error clearing jobs:', error);
        addToast('Failed to clear jobs', 'error');
      }
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await deleteJob(jobId);
        setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
        setFilteredJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
        addToast('Job deleted successfully', 'success');
      } catch (error) {
        console.error('Error deleting job:', error);
        addToast('Failed to delete job', 'error');
      }
    }
  };

  const handleEditJob = (jobId) => {
    navigate(`/post-job?edit=${jobId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
              Find Your Perfect <span className="text-blue-600">Local Opportunity</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Discover jobs in your neighborhood. Connect with local employers and find opportunities that match your skills.
            </p>
          </div>

          {/* Search Section */}
          <div className="mt-8 max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button 
                onClick={() => setShowFilters(!showFilters)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6"
              >
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="lg:w-1/4">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                  <button
                    onClick={handleClearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Clear all
                  </button>
                </div>

                <div className="space-y-6">
                  <FilterSection
                    title="Job Type"
                    options={filterOptions.jobType}
                    category="jobType"
                    selectedFilters={selectedFilters.jobType}
                    onFilterChange={handleFilterChange}
                  />

                  <FilterSection
                    title="Salary Range"
                    options={filterOptions.salaryRange}
                    category="salaryRange"
                    selectedFilters={selectedFilters.salaryRange}
                    onFilterChange={handleFilterChange}
                  />

                  <FilterSection
                    title="Accessibility"
                    options={filterOptions.accessibility}
                    category="accessibility"
                    selectedFilters={selectedFilters.accessibility}
                    onFilterChange={handleFilterChange}
                  />

                  <FilterSection
                    title="Suitable For"
                    options={filterOptions.suitableFor}
                    category="suitableFor"
                    selectedFilters={selectedFilters.suitableFor}
                    onFilterChange={handleFilterChange}
                  />

                  <FilterSection
                    title="Distance"
                    options={filterOptions.distance}
                    category="distance"
                    selectedFilters={selectedFilters.distance}
                    onFilterChange={handleFilterChange}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Job Listings */}
          <div className={`${showFilters ? 'lg:w-3/4' : 'w-full'}`}>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Available Jobs</h1>
            </div>
            <div className="bg-white rounded-lg shadow-sm">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading jobs...</p>
                </div>
              ) : filteredJobs.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {filteredJobs.map((job) => (
                    <div key={job.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            <Link to={`/jobs/${job.id}`} className="hover:text-blue-600">
                              {job.title}
                            </Link>
                          </h3>
                          <p className="text-gray-600">{job.company}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {currentUser && job.posterId === currentUser.uid && (
                            <>
                              <button
                                onClick={() => handleEditJob(job.id)}
                                className="p-2 text-blue-600 hover:text-blue-700 rounded-full hover:bg-blue-50"
                                title="Edit job"
                              >
                                <Edit2 className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDeleteJob(job.id)}
                                className="p-2 text-red-600 hover:text-red-700 rounded-full hover:bg-red-50"
                                title="Delete job"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => toggleSaveJob(job.id)}
                            className={`p-2 rounded-full ${
                              savedJobs.includes(job.id)
                                ? 'text-red-500 hover:text-red-600'
                                : 'text-gray-400 hover:text-gray-500'
                            }`}
                          >
                            <Heart className={`h-5 w-5 ${savedJobs.includes(job.id) ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-4">
                        <div className="flex items-center text-gray-600">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Briefcase className="h-4 w-4 mr-1" />
                          <span>{job.type}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <DollarSign className="h-4 w-4 mr-1" />
                          <span>{job.price}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{job.posted}</span>
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-gray-600 line-clamp-2">{job.description}</p>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {job.tags?.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-600">No jobs found matching your criteria.</p>
                  <Button
                    onClick={() => navigate('/post-job')}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Post a Job
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 