import { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthContext';

const JobContext = createContext({
  jobs: [],
  loading: true,
  error: null,
  postJob: async () => {},
  fetchJobs: async () => {},
  fetchJobById: async () => {},
  updateJob: async () => {},
  deleteJob: async () => {},
  applyForJob: async () => {},
  savedJobs: [],
  toggleSavedJob: () => {},
  filters: {
    jobType: [],
    salaryRange: [],
    accessibility: [],
    suitableFor: [],
    distance: []
  },
  updateFilters: () => {}
});

export function useJobs() {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error('useJobs must be used within a JobProvider');
  }
  return context;
}

export function JobProvider({ children }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedJobs, setSavedJobs] = useState([]);
  const [filters, setFilters] = useState({
    jobType: [],
    salaryRange: [],
    accessibility: [],
    suitableFor: [],
    distance: []
  });
  const { currentUser } = useAuth();

  // Fetch jobs
  async function fetchJobs() {
    try {
      setLoading(true);
      setError(null);

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
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to fetch jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Fetch saved jobs
  async function fetchSavedJobs() {
    if (!currentUser) {
      setSavedJobs([]);
      return;
    }

    try {
      const savedJobsQuery = query(
        collection(db, 'savedJobs'),
        where('userId', '==', currentUser.uid)
      );
      const savedJobsSnapshot = await getDocs(savedJobsQuery);
      const savedJobIds = savedJobsSnapshot.docs.map(doc => doc.data().jobId);
      setSavedJobs(savedJobIds);
    } catch (err) {
      console.error('Error fetching saved jobs:', err);
    }
  }

  // Post a new job
  async function postJob(jobData) {
    try {
      setError(null);

      if (!currentUser) {
        throw new Error('You must be logged in to post a job');
      }

      const jobWithMetadata = {
        ...jobData,
        employerId: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'active',
        applications: []
      };

      const docRef = await addDoc(collection(db, 'jobs'), jobWithMetadata);
      return docRef.id;
    } catch (err) {
      console.error('Error posting job:', err);
      throw new Error('Failed to post job. Please try again.');
    }
  }

  // Fetch a single job by ID
  async function fetchJobById(jobId) {
    try {
      const jobDoc = await getDoc(doc(db, 'jobs', jobId));
      if (!jobDoc.exists()) {
        throw new Error('Job not found');
      }
      return {
        id: jobDoc.id,
        ...jobDoc.data()
      };
    } catch (err) {
      console.error('Error fetching job:', err);
      throw new Error('Failed to fetch job details. Please try again.');
    }
  }

  // Update a job
  async function updateJob(jobId, jobData) {
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to update a job');
      }

      const jobRef = doc(db, 'jobs', jobId);
      const jobDoc = await getDoc(jobRef);

      if (!jobDoc.exists()) {
        throw new Error('Job not found');
      }

      if (jobDoc.data().employerId !== currentUser.uid) {
        throw new Error('You are not authorized to update this job');
      }

      await updateDoc(jobRef, {
        ...jobData,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error('Error updating job:', err);
      throw new Error('Failed to update job. Please try again.');
    }
  }

  // Delete a job
  async function deleteJob(jobId) {
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to delete a job');
      }

      const jobRef = doc(db, 'jobs', jobId);
      const jobDoc = await getDoc(jobRef);

      if (!jobDoc.exists()) {
        throw new Error('Job not found');
      }

      if (jobDoc.data().employerId !== currentUser.uid) {
        throw new Error('You are not authorized to delete this job');
      }

      await deleteDoc(jobRef);
    } catch (err) {
      console.error('Error deleting job:', err);
      throw new Error('Failed to delete job. Please try again.');
    }
  }

  // Apply for a job
  async function applyForJob(jobId, applicationData) {
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to apply for a job');
      }

      const jobRef = doc(db, 'jobs', jobId);
      const jobDoc = await getDoc(jobRef);

      if (!jobDoc.exists()) {
        throw new Error('Job not found');
      }

      const jobData = jobDoc.data();
      const existingApplication = jobData.applications?.find(app => app.userId === currentUser.uid);

      if (existingApplication) {
        throw new Error('You have already applied for this job');
      }

      const newApplication = {
        userId: currentUser.uid,
        ...applicationData,
        appliedAt: serverTimestamp(),
        status: 'pending'
      };

      await updateDoc(jobRef, {
        applications: [...(jobData.applications || []), newApplication]
      });
    } catch (err) {
      console.error('Error applying for job:', err);
      throw new Error('Failed to apply for job. Please try again.');
    }
  }

  // Toggle saved job
  async function toggleSavedJob(jobId) {
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to save a job');
      }

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
          jobId,
          savedAt: serverTimestamp()
        });
        setSavedJobs(prev => [...prev, jobId]);
      } else {
        // Unsave the job
        await deleteDoc(doc(db, 'savedJobs', savedJobsSnapshot.docs[0].id));
        setSavedJobs(prev => prev.filter(id => id !== jobId));
      }
    } catch (err) {
      console.error('Error toggling saved job:', err);
      throw new Error('Failed to update saved job. Please try again.');
    }
  }

  // Update filters
  function updateFilters(category, value) {
    setFilters(prev => {
      const currentValues = prev[category] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      
      return {
        ...prev,
        [category]: newValues
      };
    });
  }

  // Fetch jobs on mount and when auth state changes
  useEffect(() => {
    if (currentUser) {
      fetchJobs();
      fetchSavedJobs();
    } else {
      setJobs([]);
      setSavedJobs([]);
      setLoading(false);
      setError('Please login to view jobs');
    }
  }, [currentUser]);

  const value = {
    jobs,
    loading,
    error,
    postJob,
    fetchJobs,
    fetchJobById,
    updateJob,
    deleteJob,
    applyForJob,
    savedJobs,
    toggleSavedJob,
    filters,
    updateFilters
  };

  return (
    <JobContext.Provider value={value}>
      {children}
    </JobContext.Provider>
  );
} 