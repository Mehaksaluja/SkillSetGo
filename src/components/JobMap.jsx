import { useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';

export function JobMap({ jobs }) {
  const mapRef = useRef(null);

  useEffect(() => {
    // Initialize map (this is a placeholder - you'll need to integrate with a mapping service)
    const initializeMap = () => {
      // TODO: Implement actual map initialization with a service like Google Maps, Mapbox, etc.
      console.log('Initializing map with jobs:', jobs);
    };

    initializeMap();
  }, [jobs]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="relative h-[600px] bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
        {/* Placeholder map UI */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Map View</h3>
            <p className="text-sm text-gray-500 mt-1">
              {jobs.length} jobs in your area
            </p>
          </div>
        </div>

        {/* Job markers will be rendered here */}
        <div ref={mapRef} className="absolute inset-0" />

        {/* Job list overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-200">
          <div className="flex gap-4 overflow-x-auto pb-2">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="flex-shrink-0 w-64 bg-white rounded-lg shadow-sm p-4 border border-gray-200 hover:shadow-md transition-shadow duration-300"
              >
                <h3 className="font-medium text-gray-900 truncate">{job.title}</h3>
                <p className="text-sm text-gray-600 truncate mt-1">{job.company}</p>
                <div className="mt-3 flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{job.location}</span>
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <span>{job.distance}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 