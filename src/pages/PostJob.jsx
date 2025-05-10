import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToaster } from '@/components/ui/Toaster';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function PostJob() {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const { currentUser } = useAuth();
  const { addToast } = useToaster();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    type: 'full-time',
    salary: '',
    description: '',
    requirements: '',
    responsibilities: '',
    contact: {
      name: '',
      email: '',
      phone: ''
    }
  });

  useEffect(() => {
    if (!currentUser) {
      navigate('/signin');
      return;
    }

    if (jobId) {
      const loadJob = async () => {
        try {
          const jobDoc = await getDoc(doc(db, 'jobs', jobId));
          if (jobDoc.exists()) {
            const jobData = jobDoc.data();
            if (jobData.userId !== currentUser.uid) {
              addToast('You are not authorized to edit this job', 'error');
              navigate('/jobs');
              return;
            }
            setFormData(jobData);
          } else {
            addToast('Job not found', 'error');
            navigate('/jobs');
          }
        } catch (error) {
          console.error('Error loading job:', error);
          addToast('Failed to load job details', 'error');
          navigate('/jobs');
        }
      };

      loadJob();
    }
  }, [jobId, currentUser, navigate, addToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      navigate('/signin');
      return;
    }

    try {
      setIsLoading(true);

      // Validate required fields
      const requiredFields = ['title', 'company', 'location', 'type', 'salary', 'description'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      
      if (missingFields.length > 0) {
        addToast(`Please fill in all required fields: ${missingFields.join(', ')}`, 'error');
        return;
      }

      const jobData = {
        ...formData,
        userId: currentUser.uid,
        updatedAt: serverTimestamp()
      };

      if (!jobId) {
        // Creating a new job
        jobData.createdAt = serverTimestamp();
        jobData.status = 'active';
        await setDoc(doc(db, 'jobs', crypto.randomUUID()), jobData);
        addToast('Job posted successfully', 'success');
      } else {
        // Updating an existing job
        await setDoc(doc(db, 'jobs', jobId), jobData, { merge: true });
        addToast('Job updated successfully', 'success');
      }

      navigate('/jobs');
    } catch (error) {
      console.error('Error saving job:', error);
      addToast('Failed to save job', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('contact.')) {
      const contactField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        contact: {
          ...prev.contact,
          [contactField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {jobId ? 'Edit Job' : 'Post a New Job'}
          </h1>
          <p className="mt-2 text-gray-600">
            {jobId ? 'Update your job listing details below.' : 'Fill in the details below to post your job.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
            <div className="flex items-center space-x-2 mb-6">
              <div className="h-8 w-1 bg-blue-600 rounded-full"></div>
              <h2 className="text-xl font-semibold text-gray-900">Job Details</h2>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title *
                  </label>
                  <Input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Senior Software Engineer"
                    className="focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <Input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="e.g., Tech Corp"
                    className="focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <Input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g., New York, NY"
                    className="focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Type *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Salary *
                </label>
                <Input
                  type="text"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  placeholder="e.g., $80,000 - $100,000"
                  className="focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Describe the job responsibilities and requirements..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Requirements
                </label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  rows="3"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="List the required skills and qualifications..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Responsibilities
                </label>
                <textarea
                  name="responsibilities"
                  value={formData.responsibilities}
                  onChange={handleChange}
                  rows="3"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="List the main responsibilities..."
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
            <div className="flex items-center space-x-2 mb-6">
              <div className="h-8 w-1 bg-blue-600 rounded-full"></div>
              <h2 className="text-xl font-semibold text-gray-900">Contact Information</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Name
                </label>
                <Input
                  type="text"
                  name="contact.name"
                  value={formData.contact.name}
                  onChange={handleChange}
                  placeholder="Name of the contact person"
                  className="focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email
                </label>
                <Input
                  type="email"
                  name="contact.email"
                  value={formData.contact.email}
                  onChange={handleChange}
                  placeholder="Email for job inquiries"
                  className="focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Phone
                </label>
                <Input
                  type="tel"
                  name="contact.phone"
                  value={formData.contact.phone}
                  onChange={handleChange}
                  placeholder="Phone number for job inquiries"
                  className="focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              onClick={() => navigate('/jobs')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-lg transition-colors"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg shadow-sm hover:shadow-md transition-all"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : jobId ? 'Update Job' : 'Post Job'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 