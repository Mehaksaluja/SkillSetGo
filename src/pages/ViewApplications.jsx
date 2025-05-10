import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { useToaster } from '@/components/ui/Toaster';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, serverTimestamp, orderBy, deleteDoc } from 'firebase/firestore';
import { CheckCircle, XCircle, Clock, Mail, Phone, User, Briefcase, MapPin, DollarSign, Trash2 } from 'lucide-react';

export default function ViewApplications() {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth();
  const { addToast } = useToaster();
  const navigate = useNavigate();

  const loadJobs = async () => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('Current user:', currentUser.uid); // Debug log

      // Get all jobs posted by the current user
      const jobsQuery = query(
        collection(db, 'jobs'),
        where('userId', '==', currentUser.uid)
      );

      console.log('Executing query...'); // Debug log
      const jobsSnapshot = await getDocs(jobsQuery);
      console.log('Query results:', jobsSnapshot.docs.length, 'jobs found'); // Debug log
      
      const jobsData = jobsSnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Job data:', { id: doc.id, ...data }); // Debug log
        return {
          id: doc.id,
          ...data,
          applications: data.applications || [] // Ensure applications array exists
        };
      });

      console.log('Processed jobs data:', jobsData); // Debug log
      setJobs(jobsData);
    } catch (error) {
      console.error('Detailed error loading jobs:', error);
      addToast(`Failed to load jobs: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [currentUser]);

  const handleUpdateStatus = async (jobId, applicationId, newStatus) => {
    try {
      const jobRef = doc(db, 'jobs', jobId);
      const jobDoc = await getDoc(jobRef);
      
      if (!jobDoc.exists()) {
        addToast('Job not found', 'error');
        return;
      }

      const jobData = jobDoc.data();
      const updatedApplications = jobData.applications.map(app => {
        if (app.userId === applicationId) {
          return { ...app, status: newStatus };
        }
        return app;
      });

      await updateDoc(jobRef, {
        applications: updatedApplications,
        updatedAt: new Date().toISOString()
      });

      // Update local state
      setJobs(prev => prev.map(job => {
        if (job.id === jobId) {
          return {
            ...job,
            applications: updatedApplications
          };
        }
        return job;
      }));

      addToast(`Application ${newStatus} successfully`, 'success');
    } catch (error) {
      console.error('Error updating application status:', error);
      addToast('Failed to update application status', 'error');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        const jobRef = doc(db, 'jobs', jobId);
        await deleteDoc(jobRef);
        setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
        addToast('Job deleted successfully', 'success');
      } catch (error) {
        console.error('Error deleting job:', error);
        addToast('Failed to delete job', 'error');
      }
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'accepted':
        return 'Accepted';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Pending';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Recently';
    try {
      return new Date(timestamp).toLocaleDateString();
    } catch (error) {
      return 'Recently';
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-gray-600 mb-6">You need to be signed in to view applications.</p>
          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white px-8">
            <Link to="/signin">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Job Applications</h1>
            <p className="text-gray-600 mt-1">Manage and review job applications</p>
          </div>
          <Button 
            onClick={loadJobs} 
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 shadow-sm hover:shadow-md transition-all"
          >
            Refresh
          </Button>
        </div>

        {jobs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="max-w-md mx-auto">
              <p className="text-gray-600 mb-6 text-lg">You haven't posted any jobs yet.</p>
              <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white px-8 shadow-sm hover:shadow-md transition-all">
                <Link to="/post-job">Post a Job</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">{job.title}</h2>
                    <p className="text-gray-600 mt-1">{job.company}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDeleteJob(job.id)}
                      className="p-2 text-red-600 hover:text-red-700 rounded-full hover:bg-red-50 transition-colors"
                      title="Delete job"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center text-gray-600 bg-blue-50 rounded-lg p-3">
                    <Briefcase className="h-5 w-5 mr-2 text-blue-600" />
                    <span>{job.type}</span>
                  </div>
                  <div className="flex items-center text-gray-600 bg-blue-50 rounded-lg p-3">
                    <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600 bg-blue-50 rounded-lg p-3">
                    <Clock className="h-5 w-5 mr-2 text-blue-600" />
                    <span>{job.type}</span>
                  </div>
                  <div className="flex items-center text-gray-600 bg-blue-50 rounded-lg p-3">
                    <DollarSign className="h-5 w-5 mr-2 text-blue-600" />
                    <span>{job.salary}</span>
                  </div>
                </div>

                {job.applications?.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm mr-2">
                        {job.applications.length}
                      </span>
                      Applications
                    </h3>
                    {job.applications.map((application) => (
                      <div key={application.userId} className="border border-gray-200 rounded-xl p-6 hover:bg-blue-50 transition-colors">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-4">
                          <div className="space-y-3">
                            <h4 className="text-lg font-medium text-gray-900">
                              {application.applicantDetails.name}
                            </h4>
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-blue-600" />
                              <span className="text-gray-600">{application.applicantDetails.email}</span>
                            </div>
                            {application.applicantDetails.phone && (
                              <div className="flex items-center space-x-2">
                                <Phone className="h-4 w-4 text-blue-600" />
                                <span className="text-gray-600">{application.applicantDetails.phone}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-full">
                              {getStatusIcon(application.status)}
                              <span className="text-sm font-medium text-gray-900">
                                {getStatusText(application.status)}
                              </span>
                            </div>
                            {application.status === 'pending' && (
                              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateStatus(job.id, application.userId, 'accepted')}
                                  className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto shadow-sm hover:shadow-md transition-all"
                                >
                                  Accept
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateStatus(job.id, application.userId, 'rejected')}
                                  className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto shadow-sm hover:shadow-md transition-all"
                                >
                                  Reject
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 mt-4 flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-blue-600" />
                          Applied on {formatDate(application.appliedAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-blue-50 rounded-xl">
                    <p className="text-gray-600">No applications yet</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 