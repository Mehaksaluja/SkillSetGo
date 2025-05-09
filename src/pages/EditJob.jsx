import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { getJobById, updateJob } from '@/data/jobs';

export default function EditJob() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [job, setJob] = useState(null);

  useEffect(() => {
    const jobData = getJobById(jobId);
    if (!jobData) {
      navigate('/jobs');
      return;
    }

    // Check if the current user is the job poster
    if (jobData.postedBy !== currentUser?.uid) {
      navigate('/jobs');
      return;
    }

    setJob({
      ...jobData,
      requirements: jobData.requirements.join('\n'),
      responsibilities: jobData.responsibilities.join('\n')
    });
  }, [jobId, currentUser, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setJob(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setJob(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      navigate('/signin');
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert requirements and responsibilities strings to arrays
      const formattedJobData = {
        ...job,
        requirements: job.requirements.split('\n').filter(req => req.trim()),
        responsibilities: job.responsibilities.split('\n').filter(resp => resp.trim()),
      };

      // Update the job
      updateJob(jobId, formattedJobData);
      
      alert('Job updated successfully!');
      navigate('/jobs');
    } catch (error) {
      console.error('Error updating job:', error);
      alert('Failed to update job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900">Loading...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Job</h1>
          <p className="mt-2 text-gray-600">Update the details of your job posting</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Job Title *
                </label>
                <Input
                  type="text"
                  id="title"
                  name="title"
                  value={job.title}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                  Company Name *
                </label>
                <Input
                  type="text"
                  id="company"
                  name="company"
                  value={job.company}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location *
                </label>
                <Input
                  type="text"
                  id="location"
                  name="location"
                  value={job.location}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  Job Type *
                </label>
                <select
                  id="type"
                  name="type"
                  value={job.type}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Temporary">Temporary</option>
                </select>
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Salary/Price *
                </label>
                <Input
                  type="text"
                  id="price"
                  name="price"
                  value={job.price}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Job Description *
              </label>
              <Textarea
                id="description"
                name="description"
                value={job.description}
                onChange={handleChange}
                required
                rows={4}
                className="mt-1"
              />
            </div>

            <div className="mt-6">
              <label htmlFor="requirements" className="block text-sm font-medium text-gray-700">
                Requirements (one per line) *
              </label>
              <Textarea
                id="requirements"
                name="requirements"
                value={job.requirements}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Enter each requirement on a new line"
                className="mt-1"
              />
            </div>

            <div className="mt-6">
              <label htmlFor="responsibilities" className="block text-sm font-medium text-gray-700">
                Responsibilities (one per line) *
              </label>
              <Textarea
                id="responsibilities"
                name="responsibilities"
                value={job.responsibilities}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Enter each responsibility on a new line"
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/jobs')}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? 'Updating...' : 'Update Job'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 