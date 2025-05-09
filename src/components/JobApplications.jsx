import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { useToaster } from '@/components/ui/Toaster';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export function JobApplications({ jobId }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { addToast } = useToaster();

  useEffect(() => {
    // Check authentication status
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      if (!user) {
        setError('Please sign in to view applications');
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Subscribe to applications collection
    const applicationsQuery = query(
      collection(db, 'applications'),
      where('jobId', '==', jobId),
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

    // Cleanup subscription
    return () => unsubscribe();
  }, [jobId, isAuthenticated, addToast]);

  const handleExportApplications = () => {
    try {
      // Create CSV content
      const headers = ['Name', 'Email', 'Phone', 'Applied Date', 'Status'];
      const csvContent = applications
        .filter(app => app.shareContactInfo)
        .map(app => [
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
      a.download = `applications-${jobId}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting applications:', err);
      addToast('Failed to export applications', 'error');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Sign In Required
          </h2>
          <p className="text-gray-600 mb-6">
            Please sign in to view job applications.
          </p>
          <Button
            onClick={() => window.location.href = '/signin'}
            variant="default"
            className="px-6"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-600 bg-red-50 rounded-lg border border-red-200">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">
          Applications ({applications.length})
        </h2>
        <Button
          variant="outline"
          onClick={handleExportApplications}
          className="hover:bg-gray-50"
        >
          Export Applications
        </Button>
      </div>

      <div className="space-y-6">
        {applications.map((application) => (
          <div
            key={application.id}
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow duration-300"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {application.fullName}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Applied {application.appliedAt?.toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Status: <span className="capitalize font-medium">{application.status}</span>
                </p>
              </div>
            </div>

            {application.shareContactInfo && (
              <div className="mt-4 space-y-2 bg-gray-50 p-4 rounded-lg">
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

        {applications.length === 0 && (
          <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-500 text-lg">No applications yet</p>
          </div>
        )}
      </div>
    </div>
  );
} 