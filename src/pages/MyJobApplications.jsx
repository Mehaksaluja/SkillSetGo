import { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Button } from '@/components/ui/Button';
import { useToaster } from '@/components/ui/Toaster';

export function MyJobApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addToast } = useToaster();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setError('Please sign in to view applications');
        setLoading(false);
        return;
      }

      try {
        // First, get all jobs posted by the current user
        const jobsQuery = query(
          collection(db, 'jobs'),
          where('postedBy', '==', user.uid)
        );

        const jobsSnapshot = await getDocs(jobsQuery);
        const jobIds = jobsSnapshot.docs.map(doc => doc.id);

        if (jobIds.length === 0) {
          setApplications([]);
          setLoading(false);
          return;
        }

        // Then, get all applications for these jobs
        const applicationsQuery = query(
          collection(db, 'applications'),
          where('jobId', 'in', jobIds),
          orderBy('appliedAt', 'desc')
        );

        const unsubscribe = onSnapshot(
          applicationsQuery,
          (snapshot) => {
            const applicationsData = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              appliedAt: doc.data().appliedAt?.toDate()
            }));
            setApplications(applicationsData);
            setLoading(false);
          },
          (err) => {
            console.error('Error fetching applications:', err);
            setError(err.message);
            addToast('Failed to load applications', 'error');
            setLoading(false);
          }
        );

        return () => unsubscribe();
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [addToast]);

  const handleExportAll = () => {
    try {
      // Create CSV content
      const headers = ['Job Title', 'Applicant Name', 'Email', 'Phone', 'Applied Date', 'Status'];
      const csvContent = applications
        .filter(app => app.shareContactInfo)
        .map(app => [
          app.jobTitle || 'N/A',
          app.fullName,
          app.email,
          app.phone,
          app.appliedAt?.toLocaleDateString() || '',
          app.status
        ]);

      // Add headers
      csvContent.unshift(headers);

      // Convert to CSV string
      const csvString = csvContent
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      // Create and download file
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `all-applications-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting applications:', err);
      addToast('Failed to export applications', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Job Applications
        </h1>
        <Button
          variant="outline"
          onClick={handleExportAll}
          disabled={applications.length === 0}
        >
          Export All Applications
        </Button>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No applications received yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map((application) => (
            <div
              key={application.id}
              className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {application.fullName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Applied for: {application.jobTitle || 'Job'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Applied on: {application.appliedAt?.toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Status: <span className="capitalize">{application.status}</span>
                  </p>
                </div>
              </div>

              {application.shareContactInfo && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Email:</span> {application.email}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Phone:</span> {application.phone}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 