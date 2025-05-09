import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { Building, MapPin, Clock, DollarSign, Mail, Phone, Heart } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useToaster } from '@/components/ui/Toaster';

export default function JobDetails() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { addToast } = useToaster();

  useEffect(() => {
    const loadJobDetails = async () => {
      try {
        // Get job details from Firestore
        const jobDoc = await getDoc(doc(db, 'jobs', jobId));
        if (!jobDoc.exists()) {
          setIsLoading(false);
          return;
        }

        const jobData = jobDoc.data();
        setJob({ id: jobDoc.id, ...jobData });

        // Check if user has applied
        if (currentUser) {
          const hasUserApplied = jobData.applications?.some(
            app => app.userId === currentUser.uid
          );
          setHasApplied(hasUserApplied);

          // Check if job is saved
          const isJobSaved = jobData.savedBy?.includes(currentUser.uid);
          setIsSaved(isJobSaved);
        }
      } catch (error) {
        console.error('Error loading job details:', error);
        addToast('Failed to load job details', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    loadJobDetails();
  }, [jobId, currentUser, addToast]);

  const handleApply = async () => {
    if (!currentUser) {
      navigate('/signin');
      return;
    }

    try {
      const jobRef = doc(db, 'jobs', jobId);
      const jobDoc = await getDoc(jobRef);
      
      if (!jobDoc.exists()) {
        addToast('Job not found', 'error');
        return;
      }

      const jobData = jobDoc.data();
      
      // Check if already applied
      if (jobData.applications?.some(app => app.userId === currentUser.uid)) {
        addToast('You have already applied for this job', 'warning');
        return;
      }

      // Create new application
      const applicationData = {
        userId: currentUser.uid,
        status: 'pending',
        appliedAt: new Date().toISOString(),
        applicantDetails: {
          name: currentUser.displayName || 'Anonymous',
          email: currentUser.email || '',
          phone: currentUser.phoneNumber || ''
        },
        shareContactInfo: true,
        jobTitle: jobData.title,
        company: jobData.company
      };

      // Update job document with new application
      const updatedApplications = [...(jobData.applications || []), applicationData];
      
      await updateDoc(jobRef, {
        applications: updatedApplications,
        updatedAt: serverTimestamp()
      });

      // Update local state
      setJob(prev => ({
        ...prev,
        applications: updatedApplications
      }));
      setHasApplied(true);
      
      addToast('Application submitted successfully!', 'success');
      navigate('/applied-jobs');
    } catch (error) {
      console.error('Error submitting application:', error);
      addToast(
        error.message || 'Failed to submit application. Please try again.',
        'error'
      );
    }
  };

  const toggleSaveJob = async () => {
    if (!currentUser) {
      navigate('/signin');
      return;
    }

    try {
      const jobRef = doc(db, 'jobs', jobId);
      const jobDoc = await getDoc(jobRef);
      
      if (!jobDoc.exists()) {
        addToast('Job not found', 'error');
        return;
      }

      const jobData = jobDoc.data();
      const savedBy = jobData.savedBy || [];

      if (isSaved) {
        // Remove from saved jobs
        await updateDoc(jobRef, {
          savedBy: savedBy.filter(id => id !== currentUser.uid)
        });
        setIsSaved(false);
        addToast('Job removed from saved jobs', 'success');
      } else {
        // Add to saved jobs
        await updateDoc(jobRef, {
          savedBy: [...savedBy, currentUser.uid]
        });
        setIsSaved(true);
        addToast('Job saved successfully', 'success');
      }
    } catch (error) {
      console.error('Error toggling saved job:', error);
      addToast('Failed to update saved jobs', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Job not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
            <div className="mt-2 flex items-center space-x-4 text-gray-500">
              <div className="flex items-center">
                <Building className="h-5 w-5 mr-1" />
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
          </div>
          <div className="flex space-x-4">
            <Button
              variant="outline"
              onClick={toggleSaveJob}
              className={isSaved ? 'text-blue-600 border-blue-600' : ''}
            >
              <Heart className={`h-5 w-5 mr-2 ${isSaved ? 'fill-current' : ''}`} />
              {isSaved ? 'Saved' : 'Save Job'}
            </Button>
            <Button
              onClick={handleApply}
              disabled={hasApplied}
              className={hasApplied ? 'bg-gray-500' : ''}
            >
              {hasApplied ? 'Applied' : 'Apply Now'}
            </Button>
          </div>
        </div>

        <div className="prose max-w-none">
          <h2 className="text-xl font-semibold mb-4">Job Description</h2>
          <p className="text-gray-600 whitespace-pre-wrap">{job.description}</p>

          {job.requirements && (
            <>
              <h2 className="text-xl font-semibold mt-8 mb-4">Requirements</h2>
              <ul className="list-disc list-inside text-gray-600">
                {Array.isArray(job.requirements) ? (
                  job.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))
                ) : (
                  <li>{job.requirements}</li>
                )}
              </ul>
            </>
          )}

          {(job.contactEmail || job.contactPhone) && (
            <>
              <h2 className="text-xl font-semibold mt-8 mb-4">Contact Information</h2>
              <div className="space-y-2 text-gray-600">
                {job.contactEmail && (
                  <p className="flex items-center">
                    <Mail className="h-5 w-5 mr-2" />
                    {job.contactEmail}
                  </p>
                )}
                {job.contactPhone && (
                  <p className="flex items-center">
                    <Phone className="h-5 w-5 mr-2" />
                    {job.contactPhone}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 