import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Briefcase, MapPin, Clock, DollarSign, CheckCircle, XCircle, Clock as ClockIcon } from 'lucide-react';
import { useToaster } from '@/components/ui/Toaster';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

export default function AppliedJobs() {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth();
  const { addToast } = useToaster();
  const navigate = useNavigate();

  const loadApplications = async () => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      // Get all jobs
      const jobsQuery = query(
        collection(db, 'jobs'),
        orderBy('createdAt', 'desc')
      );
      const jobsSnapshot = await getDocs(jobsQuery);
      
      // Filter jobs where the user has applied
      const applicationsData = [];
      for (const jobDoc of jobsSnapshot.docs) {
        const jobData = jobDoc.data();
        const userApplication = jobData.applications?.find(app => app.userId === currentUser.uid);
        
        if (userApplication) {
          applicationsData.push({
            id: jobDoc.id,
            status: userApplication.status || 'pending',
            appliedAt: userApplication.appliedAt,
            job: {
              id: jobDoc.id,
              title: jobData.title || 'Untitled Position',
              company: jobData.company || 'Company Not Specified',
              location: jobData.location || 'Location Not Specified',
              type: jobData.type || 'Not Specified',
              salary: jobData.salary || 'Not Specified',
              description: jobData.description || 'No description available'
            }
          });
        }
      }
      
      // Sort applications by appliedAt date
      applicationsData.sort((a, b) => {
        if (!a.appliedAt || !b.appliedAt) return 0;
        const dateA = new Date(a.appliedAt);
        const dateB = new Date(b.appliedAt);
        return dateB - dateA;
      });
      
      setApplications(applicationsData);
    } catch (error) {
      console.error('Error loading applications:', error);
      addToast('Failed to load applications. Please try again later.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [currentUser]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
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
          <p className="text-gray-600 mb-4">You need to be signed in to view your applications.</p>
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Applied Jobs</h1>
        <Button onClick={loadApplications} variant="outline">
          Refresh
        </Button>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">You haven't applied for any jobs yet.</p>
          <Button asChild>
            <Link to="/jobs">Browse Jobs</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map((application) => (
            <div key={application.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    <Link to={`/jobs/${application.job.id}`} className="hover:text-blue-600">
                      {application.job.title}
                    </Link>
                  </h2>
                  <p className="text-gray-600">{application.job.company}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(application.status)}
                  <span className="text-sm font-medium text-gray-900">
                    {getStatusText(application.status)}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-4">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{application.job.location}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Briefcase className="h-4 w-4 mr-1" />
                  <span>{application.job.type}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <DollarSign className="h-4 w-4 mr-1" />
                  <span>{application.job.salary}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Applied {formatDate(application.appliedAt)}</span>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-gray-600 line-clamp-2">{application.job.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 