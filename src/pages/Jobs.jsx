import { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { MapPin, Clock, DollarSign, Star, Briefcase, Heart, X } from 'lucide-react';
import { useAuth } from "@/context/AuthContext";
import { useJobs } from "@/context/JobContext";
import { useNavigate } from "react-router-dom";
import { useToaster } from '@/components/ui/Toaster';

export default function Jobs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDistance, setSelectedDistance] = useState("30");
  const [selectedJob, setSelectedJob] = useState(null);
  const { currentUser } = useAuth();
  const { jobs, loading, error, savedJobs, toggleSavedJob } = useJobs();
  const navigate = useNavigate();
  const { addToast } = useToaster();

  const categories = [
    { id: "all", name: "All Categories" },
    { id: "household", name: "Household Help" },
    { id: "cleaning", name: "Cleaning" },
    { id: "cooking", name: "Cooking" },
    { id: "caretaking", name: "Caretaking" },
    { id: "teaching", name: "Teaching" },
    { id: "other", name: "Other Services" },
  ];

  const distances = [
    { value: "5", label: "5 km" },
    { value: "10", label: "10 km" },
    { value: "30", label: "30 km" },
    { value: "50", label: "50 km" },
  ];

  const handleJobClick = (job) => {
    setSelectedJob(job);
  };

  const handleCloseDetails = () => {
    setSelectedJob(null);
  };

  const handleSaveJob = async (jobId) => {
    try {
      await toggleSavedJob(jobId);
    } catch (error) {
      if (error.message.includes('must be logged in')) {
        navigate('/signin');
      } else {
        addToast(error.message, 'error');
      }
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">{error}</p>
          {error === 'Please login to view jobs' ? (
            <Button onClick={() => navigate('/signin')} className="bg-blue-600 hover:bg-blue-700 text-white">
              Login to View Jobs
            </Button>
          ) : (
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Filter jobs based on search query and category
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = searchQuery === "" || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === "all" || job.category === selectedCategory;
    const matchesDistance = !job.distance || parseFloat(job.distance) <= parseFloat(selectedDistance);

    return matchesSearch && matchesCategory && matchesDistance;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="md:col-span-2">
              <Input
                type="text"
                placeholder="Search for jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full focus:border-blue-600 focus:ring-blue-600"
              />
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Distance Filter */}
            <div>
              <select
                value={selectedDistance}
                onChange={(e) => setSelectedDistance(e.target.value)}
                className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              >
                {distances.map((distance) => (
                  <option key={distance.value} value={distance.value}>
                    Within {distance.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Jobs List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Jobs List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              {filteredJobs.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {filteredJobs.map((job) => (
                    <div
                      key={job.id}
                      className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handleJobClick(job)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {job.title}
                          </h3>
                          <p className="text-gray-600">{job.company}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveJob(job.id);
                          }}
                          className={`p-2 rounded-full ${
                            savedJobs.includes(job.id)
                              ? 'text-red-500 hover:text-red-600'
                              : 'text-gray-400 hover:text-gray-500'
                          }`}
                        >
                          <Heart className="h-5 w-5" fill={savedJobs.includes(job.id) ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center text-gray-600">
                          <MapPin className="h-5 w-5 mr-2" />
                          {job.location}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock className="h-5 w-5 mr-2" />
                          {job.type}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <DollarSign className="h-5 w-5 mr-2" />
                          {job.salary}
                        </div>
                      </div>
                      <p className="mt-4 text-gray-600 line-clamp-2">{job.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Briefcase className="h-12 w-12 text-gray-400 mx-auto" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No jobs found</h3>
                  <p className="mt-2 text-gray-600">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Job Details Sidebar */}
          <div className="lg:col-span-1">
            {selectedJob ? (
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">{selectedJob.title}</h2>
                  <button
                    onClick={handleCloseDetails}
                    className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Company</h3>
                    <p className="mt-1 text-gray-900">{selectedJob.company}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Location</h3>
                    <p className="mt-1 text-gray-900">{selectedJob.location}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Job Type</h3>
                    <p className="mt-1 text-gray-900">{selectedJob.type}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Salary</h3>
                    <p className="mt-1 text-gray-900">{selectedJob.salary}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Description</h3>
                    <p className="mt-1 text-gray-900 whitespace-pre-wrap">{selectedJob.description}</p>
                  </div>
                  <div className="pt-4">
                    <Button
                      onClick={() => navigate(`/jobs/${selectedJob.id}`)}
                      className="w-full"
                    >
                      View Full Details
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">Select a job</h3>
                <p className="mt-2 text-gray-600">
                  Click on a job to view its details
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 