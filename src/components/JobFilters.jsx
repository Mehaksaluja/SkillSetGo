import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { Filter, X } from 'lucide-react';
import { useJobs } from '@/context/JobContext';

function FilterSection({ title, options, category, selectedFilters, onFilterChange }) {
  if (!options || !Array.isArray(options)) return null;

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900">{title}</h3>
      <div className="space-y-3">
        {options.map((option) => (
          <div key={option} className="flex items-center justify-between">
            <label className="text-sm text-gray-600">{option}</label>
            <Switch
              checked={selectedFilters.includes(option)}
              onCheckedChange={() => onFilterChange(category, option)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function JobFilters({ filterOptions }) {
  const { filters, updateFilters, clearFilters } = useJobs();
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (category, value) => {
    updateFilters(category, value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 hover:bg-gray-100"
        >
          {showFilters ? (
            <>
              <X className="h-4 w-4" />
              Hide Filters
            </>
          ) : (
            <>
              <Filter className="h-4 w-4" />
              Show Filters
            </>
          )}
        </Button>
      </div>

      {showFilters && (
        <div className="space-y-8 bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <FilterSection
            title="Job Type"
            options={filterOptions.jobType}
            category="jobType"
            selectedFilters={filters.jobType}
            onFilterChange={handleFilterChange}
          />

          <FilterSection
            title="Salary Range"
            options={filterOptions.salaryRange}
            category="salaryRange"
            selectedFilters={filters.salaryRange}
            onFilterChange={handleFilterChange}
          />

          <FilterSection
            title="Accessibility"
            options={filterOptions.accessibility}
            category="accessibility"
            selectedFilters={filters.accessibility}
            onFilterChange={handleFilterChange}
          />

          <FilterSection
            title="Suitable For"
            options={filterOptions.suitableFor}
            category="suitableFor"
            selectedFilters={filters.suitableFor}
            onFilterChange={handleFilterChange}
          />

          <FilterSection
            title="Distance"
            options={filterOptions.distance}
            category="distance"
            selectedFilters={filters.distance}
            onFilterChange={handleFilterChange}
          />

          <Button
            variant="outline"
            className="w-full hover:bg-gray-50"
            onClick={clearFilters}
          >
            Clear All Filters
          </Button>
        </div>
      )}

      {/* Active Filters */}
      {Object.entries(filters).map(([category, values]) => {
        if (values.length === 0) return null;
        return (
          <div key={category} className="flex flex-wrap gap-2">
            {values.map((value) => (
              <div
                key={value}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700 border border-blue-200"
              >
                <span>{value}</span>
                <button
                  onClick={() => handleFilterChange(category, value)}
                  className="hover:text-blue-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
} 