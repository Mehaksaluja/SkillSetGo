import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Heart, MapPin, Briefcase, DollarSign, Clock } from 'lucide-react';
import { useToaster } from '@/components/ui/Toaster';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, deleteDoc, doc, getDoc } from 'firebase/firestore';

export default function SavedJobs() {
  const [savedJobs, setSavedJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth();
  const { addToast } = useToaster();

  useEffect(() => {
    const loadSavedJobs = async () => {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }

      try {
        // Get saved jobs from Firestore
        const savedJobsQuery = query(
          collection(db, 'savedJobs'),
          where('userId', '==', currentUser.uid)
        );
        const savedJobsSnapshot = await getDocs(savedJobsQuery);
        
        // Get job details for each saved job
        const jobs = [];
        for (const savedJob of savedJobsSnapshot.docs) {
          const jobDoc = await getDoc(doc(db, 'jobs', savedJob.data().jobId));
          if (jobDoc.exists()) {
            jobs.push({
              id: jobDoc.id,
              ...jobDoc.data(),
              savedAt: savedJob.data().savedAt
            });
          }
        }
        
        setSavedJobs(jobs);
      } catch (error) {
        console.error('Error loading saved jobs:', error);
        addToast('Failed to load saved jobs', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedJobs();
  }, [currentUser, addToast]);

  const handleUnsaveJob = async (jobId) => {
    if (!currentUser) return;

    try {
      // Find the saved job document
      const savedJobsQuery = query(
        collection(db, 'savedJobs'),
        where('userId', '==', currentUser.uid),
        where('jobId', '==', jobId)
      );
      const savedJobsSnapshot = await getDocs(savedJobsQuery);
      
      if (!savedJobsSnapshot.empty) {
        // Delete the saved job document
        await deleteDoc(doc(db, 'savedJobs', savedJobsSnapshot.docs[0].id));
        setSavedJobs(prev => prev.filter(job => job.id !== jobId));
        addToast('Job removed from saved jobs', 'success');
      }
    } catch (error) {
      console.error('Error unsaving job:', error);
      addToast('Failed to remove job from saved jobs', 'error');
    }
  };

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-gray-600 mb-4">You need to be signed in to view your saved jobs.</p>
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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Saved Jobs</h1>

      {savedJobs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">You haven't saved any jobs yet.</p>
          <Button asChild>
            <Link to="/jobs">Browse Jobs</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {savedJobs.map((job) => (
            <div key={job.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    <Link to={`/jobs/${job.id}`} className="hover:text-blue-600">
                      {job.title}
                    </Link>
                  </h2>
                  <p className="text-gray-600">{job.company}</p>
                </div>
                <button
                  onClick={() => handleUnsaveJob(job.id)}
                  className="p-2 text-red-500 hover:text-red-600 rounded-full hover:bg-red-50"
                >
                  <Heart className="h-5 w-5 fill-current" />
                </button>
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
                  <span>{job.salary}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Saved {job.savedAt ? new Date(job.savedAt.toDate()).toLocaleDateString() : 'Recently'}</span>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-gray-600 line-clamp-2">{job.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 