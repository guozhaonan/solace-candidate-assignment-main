import { useRef, useEffect } from "react";

interface FiltersProps {
  filters: {
    city: string;
    degree: string;
    specialties: string[];
    experienceLevel: string;
    specialtiesDropdownOpen: boolean;
  };
  onFilterChange: (filterType: string, value: string | string[] | boolean) => void;
  onDropdownToggle: (isOpen: boolean) => void;
  onReset: () => void;
}

export default function Filters({ filters, onFilterChange, onDropdownToggle, onReset }: FiltersProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onDropdownToggle(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onDropdownToggle]);

  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* City Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
        <input
          type="text"
          value={filters.city}
          onChange={(e) => onFilterChange("city", e.target.value)}
          placeholder="Filter by city..."
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Degree Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
        <select
          value={filters.degree}
          onChange={(e) => onFilterChange("degree", e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Degrees</option>
          <option value="MD">MD</option>
          <option value="PhD">PhD</option>
          <option value="MSW">MSW</option>
        </select>
      </div>

      {/* Experience Level Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
        <select
          value={filters.experienceLevel}
          onChange={(e) => onFilterChange("experienceLevel", e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Levels</option>
          <option value="emerging">Emerging (0-3 years)</option>
          <option value="established">Established (4-7 years)</option>
          <option value="expert">Expert (8+ years)</option>
        </select>
      </div>

      {/* Specialties Filter and Reset Button */}
      <div className="flex gap-2">
        <div className="relative flex-1" ref={dropdownRef}>
          <label className="block text-sm font-medium text-gray-700 mb-1">Specialties</label>
          <div className="relative">
                          <button
                type="button"
                onClick={() => onDropdownToggle(!filters.specialtiesDropdownOpen)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-left bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[42px] flex items-center justify-between"
              >
              <div className="flex flex-wrap gap-1 flex-1">
                {filters.specialties.length > 0 ? (
                  filters.specialties.map((specialty) => (
                    <span
                      key={specialty}
                      className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                    >
                      {specialty}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const newSpecialties = filters.specialties.filter(s => s !== specialty);
                          onFilterChange("specialties", newSpecialties);
                        }}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500">Select specialties...</span>
                )}
              </div>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {filters.specialtiesDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                <div className="p-2">
                  {[
                    "Bipolar", "LGBTQ", "Medication/Prescribing", "Suicide History/Attempts",
                    "General Mental Health", "Men's issues", "Relationship Issues", "Trauma & PTSD",
                    "Personality disorders", "Personal growth", "Substance use/abuse", "Pediatrics",
                    "Women's issues", "Chronic pain", "Weight loss & nutrition", "Eating disorders",
                    "Diabetic Diet and nutrition", "Coaching", "Life coaching", "Obsessive-compulsive disorders",
                    "Neuropsychological evaluations", "Attention and Hyperactivity", "Sleep issues",
                    "Schizophrenia and psychotic disorders", "Learning disorders", "Domestic abuse"
                  ].map((specialty) => (
                    <label
                      key={specialty}
                      className="flex items-center px-2 py-1.5 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.specialties.includes(specialty)}
                        onChange={(e) => {
                          const newSpecialties = e.target.checked
                            ? [...filters.specialties, specialty]
                            : filters.specialties.filter(s => s !== specialty);
                          onFilterChange("specialties", newSpecialties);
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">{specialty}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Reset Button */}
        <div className="flex items-end">
          <button 
            onClick={onReset}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors duration-200 h-[42px]"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
} 