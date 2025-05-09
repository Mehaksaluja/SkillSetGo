import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { useToaster } from '@/components/ui/Toaster';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { CheckCircle, XCircle, Clock, Mail, Phone, User, Briefcase, MapPin, DollarSign } from 'lucide-react';

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
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-gray-600 mb-4">You need to be signed in to view applications.</p>
          <Button asChild>
            <Link to="/signin">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Job Applications</h1>
        <Button onClick={loadJobs} variant="outline" className="w-full sm:w-auto">
          Refresh
        </Button>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">You haven't posted any jobs yet.</p>
          <Button asChild>
            <Link to="/post-job">Post a Job</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">{job.title}</h2>
              <div className="flex flex-wrap gap-4 text-gray-500 mb-6">
                <div className="flex items-center">
                  <Briefcase className="h-5 w-5 mr-1" />
                  {job.company}
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-1" />
                  {job.location}
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-1" />
                  {job.type}
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-1" />
                  {job.salary}
                </div>
              </div>

              {job.applications?.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Applications ({job.applications.length})</h3>
                  {job.applications.map((application) => (
                    <div key={application.userId} className="border rounded-lg p-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">
                            {application.applicantDetails.name}
                          </h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-600">{application.applicantDetails.email}</span>
                          </div>
                          {application.applicantDetails.phone && (
                            <div className="flex items-center space-x-2 mt-1">
                              <Phone className="h-4 w-4 text-gray-500" />
                              <span className="text-gray-600">{application.applicantDetails.phone}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(application.status)}
                            <span className="text-sm font-medium text-gray-900">
                              {getStatusText(application.status)}
                            </span>
                          </div>
                          {application.status === 'pending' && (
                            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateStatus(job.id, application.userId, 'accepted')}
                                className="text-green-600 border-green-600 hover:bg-green-50 w-full sm:w-auto"
                              >
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateStatus(job.id, application.userId, 'rejected')}
                                className="text-red-600 border-red-600 hover:bg-red-50 w-full sm:w-auto"
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        Applied on {formatDate(application.appliedAt)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  No applications yet
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 