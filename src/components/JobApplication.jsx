import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { FormMessage } from '@/components/ui/FormMessage';
import { useToaster } from '@/components/ui/Toaster';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export function JobApplication({ job, onClose }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    shareContactInfo: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { addToast } = useToaster();

  useEffect(() => {
    // Check authentication status
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      if (!user) {
        setError('Please sign in to apply for jobs');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!isAuthenticated) {
      setError('Please sign in to apply for jobs');
      setLoading(false);
      return;
    }

    try {
      // Add application to Firestore
      const applicationData = {
        jobId: job.id,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        shareContactInfo: formData.shareContactInfo,
        appliedAt: serverTimestamp(),
        status: 'pending',
        userId: auth.currentUser.uid // Add user ID to track who applied
      };

      const docRef = await addDoc(collection(db, 'applications'), applicationData);
      console.log('Application submitted with ID:', docRef.id);

      addToast('Application submitted successfully!', 'success');
      onClose();
    } catch (err) {
      console.error('Error submitting application:', err);
      setError(err.message);
      addToast('Failed to submit application', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-white rounded-lg p-6 max-w-2xl mx-auto">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Sign In Required
          </h2>
          <p className="text-gray-600 mb-4">
            Please sign in to apply for this job.
          </p>
          <Button
            onClick={() => window.location.href = '/signin'}
            variant="default"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        Apply for {job.title}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label required>Full Name</Label>
            <Input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label required>Email</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label required>Phone</Label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-medium text-gray-900">Data Sharing Preferences</h3>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="shareContactInfo"
                checked={formData.shareContactInfo}
                onChange={(e) => setFormData(prev => ({ ...prev, shareContactInfo: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="shareContactInfo" className="text-sm">
                Share my contact information with the employer
              </Label>
            </div>
          </div>
        </div>

        {error && <FormMessage message={error} type="error" />}

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Submit Application
          </Button>
        </div>
      </form>
    </div>
  );
} 