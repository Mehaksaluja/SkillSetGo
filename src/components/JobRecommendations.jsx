import { Button } from '@/components/ui/Button';
import { Sparkles } from 'lucide-react';

export function JobRecommendations({ jobs }) {
  // In a real app, this would be based on user preferences and job matching
  const recommendedJobs = jobs.slice(0, 3);

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-yellow-500" />
        <h2 className="text-lg font-semibold text-gray-900">Recommended for You</h2>
      </div>

      <div className="space-y-4">
        {recommendedJobs.map((job) => (
          <div
            key={job.id}
            className="p-3 rounded-lg border border-gray-200 hover:border-blue-500 transition-colors"
          >
            <h3 className="font-medium text-gray-900 truncate">{job.title}</h3>
            <p className="text-sm text-gray-600 truncate">{job.company}</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm text-gray-500">{job.location}</span>
              <Button variant="ghost" size="sm">
                View
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Button variant="outline" className="w-full mt-4">
        View All Recommendations
      </Button>
    </div>
  );
} 