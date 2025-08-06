"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { formatPhoneNumber } from "../utils/format";

interface Advocate {
  firstName: string;
  lastName: string;
  city: string;
  degree: string;
  specialties: string[];
  yearsOfExperience: number;
  phoneNumber: number;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface SearchResponse {
  data: Advocate[];
  pagination: PaginationInfo;
}

export default function Home() {
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [filteredAdvocates, setFilteredAdvocates] = useState<Advocate[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [filters, setFilters] = useState({
    city: "",
    degree: "",
    specialties: [] as string[],
    experienceLevel: "",
    specialtiesDropdownOpen: false
  });
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
    hasNextPage: false,
    hasPreviousPage: false
  });
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    
    console.log("fetching advocates...");
    fetch("/api/advocates").then((response) => {
      response.json().then((jsonResponse: SearchResponse) => {
        if (isMounted) {
          setAdvocates(jsonResponse.data);
          setFilteredAdvocates(jsonResponse.data);
          setPagination(jsonResponse.pagination);
        }
      });
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setFilters(prev => ({ ...prev, specialtiesDropdownOpen: false }));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Debounced filter function
  const debouncedFilter = useCallback(
    async (currentFilters = filters, page: number = 1) => {
      setIsLoading(true);
      
      try {
        const response = await fetch("/api/advocates", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            page,
            limit: 10,
            city: currentFilters.city,
            degree: currentFilters.degree,
            specialties: currentFilters.specialties,
            experienceLevel: currentFilters.experienceLevel
          }),
        });

        const result: SearchResponse = await response.json();
        setFilteredAdvocates(result.data);
        setPagination(result.pagination);
      } catch (error) {
        console.error("Filter failed:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [filters]
  );

  const handleFilterChange = (filterType: string, value: string | string[]) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout
    searchTimeoutRef.current = setTimeout(() => {
      if (Object.values(newFilters).some(filter => 
        Array.isArray(filter) ? filter.length > 0 : filter !== ""
      )) {
        debouncedFilter(newFilters, 1);
      } else {
        // Load all advocates when no filters
        fetch("/api/advocates").then((response) => {
          response.json().then((jsonResponse: SearchResponse) => {
            setFilteredAdvocates(jsonResponse.data);
            setPagination(jsonResponse.pagination);
          });
        });
      }
    }, 500); // Shorter delay for filter changes
  };

  const onClickReset = () => {
    fetch("/api/advocates").then((response) => {
      response.json().then((jsonResponse: SearchResponse) => {
        setFilteredAdvocates(jsonResponse.data);
        setPagination(jsonResponse.pagination);
      });
    });
    setFilters({
      city: "",
      degree: "",
      specialties: [],
      experienceLevel: "",
      specialtiesDropdownOpen: false
    });
    setIsLoading(false);
  };

  const getSearchDescription = () => {
    const activeFilters = [];
    
    if (filters.city) activeFilters.push(`in ${filters.city}`);
    if (filters.degree) activeFilters.push(`with ${filters.degree} degree`);
    if (filters.experienceLevel) {
      const levelText = {
        emerging: "Emerging (0-3 years)",
        established: "Established (4-7 years)", 
        expert: "Expert (8+ years)"
      }[filters.experienceLevel];
      activeFilters.push(`with ${levelText} experience`);
    }
    if (filters.specialties.length > 0) {
      activeFilters.push(`specializing in ${filters.specialties.join(", ")}`);
    }
    
    if (activeFilters.length === 0) {
      return "Showing all advocates";
    }
    
    return `Showing advocates ${activeFilters.join(" ")}`;
  };

  const handlePageChange = (newPage: number) => {
    // Check if any filters are active
    const hasActiveFilters = Object.values(filters).some(filter => 
      Array.isArray(filter) ? filter.length > 0 : filter !== ""
    );
    
    if (hasActiveFilters) {
      debouncedFilter(filters, newPage);
    } else {
      // Load specific page of all advocates
      fetch("/api/advocates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          page: newPage,
          limit: 10
        }),
      }).then((response) => {
        response.json().then((jsonResponse: SearchResponse) => {
          setFilteredAdvocates(jsonResponse.data);
          setPagination(jsonResponse.pagination);
        });
      });
    }
  };

  return (
    <main className="m-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Solace Advocates</h1>
      <div className="mb-8">
        <p className="text-lg font-medium text-gray-700 mb-2">Search</p>
                <p className="text-sm text-gray-600 mb-4">
          {getSearchDescription()}
        </p>

          {/* Filter Controls */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* City Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={filters.city}
                onChange={(e) => handleFilterChange("city", e.target.value)}
                placeholder="Filter by city..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Degree Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
              <select
                value={filters.degree}
                onChange={(e) => handleFilterChange("degree", e.target.value)}
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
                onChange={(e) => handleFilterChange("experienceLevel", e.target.value)}
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
                    onClick={() => setFilters(prev => ({ ...prev, specialtiesDropdownOpen: !prev.specialtiesDropdownOpen }))}
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
                                handleFilterChange("specialties", newSpecialties);
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
                                handleFilterChange("specialties", newSpecialties);
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
                  onClick={onClickReset}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors duration-200 h-[42px]"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      {isLoading ? (
        <div className="text-center py-10 px-6 text-gray-600 border border-gray-200 rounded-lg bg-gray-50">
          <div className="mb-4">
            <svg className="animate-spin mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Searching...</h3>
          <p className="text-sm text-gray-500">Finding advocates that match your search criteria.</p>
        </div>
      ) : filteredAdvocates.length === 0 ? (
        <div className="text-center py-10 px-6 text-gray-600 border border-gray-200 rounded-lg bg-gray-50">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No advocates found</h3>
          <p className="text-sm text-gray-500">Try adjusting your search terms or click "Reset Search" to see all advocates.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
              <thead className="bg-gray-50">
                <tr>
                                  <th className="table-header">First Name</th>
                <th className="table-header">Last Name</th>
                <th className="table-header">City</th>
                <th className="table-header">Degree</th>
                <th className="table-header">Specialties</th>
                <th className="table-header">Years of Experience</th>
                <th className="table-header">Phone Number</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAdvocates.map((advocate, index) => {
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="table-cell font-medium">{advocate.firstName}</td>
                      <td className="table-cell">{advocate.lastName}</td>
                      <td className="table-cell">{advocate.city}</td>
                      <td className="table-cell">{advocate.degree}</td>
                      <td className="table-cell-specialties">
                        <div className="space-y-1">
                          {advocate.specialties.map((s: string) => (
                            <div key={s} className="specialty-tag-inline">{s}</div>
                          ))}
                        </div>
                      </td>
                      <td className="table-cell">{advocate.yearsOfExperience}</td>
                      <td className="table-cell">
                        {formatPhoneNumber(advocate.phoneNumber) || 'Invalid phone number'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {filteredAdvocates.map((advocate, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                                      <h3 className="card-header">
                    {advocate.firstName} {advocate.lastName}
                  </h3>
                  <p className="card-subtitle">{advocate.city}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{advocate.degree}</p>
                  <p className="text-xs text-gray-500">{advocate.yearsOfExperience} years</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div>
                  <span className="card-label">Specialties:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {advocate.specialties.map((s: string) => (
                      <span key={s} className="specialty-tag">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <span className="card-label">Phone:</span>
                  <p className="card-value">
                    {formatPhoneNumber(advocate.phoneNumber) || 'Invalid phone number'}
                  </p>
                </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Pagination Controls */}
      {!isLoading && pagination.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{" "}
            {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} of{" "}
            {pagination.totalCount} results
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPreviousPage}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      pageNum === pagination.currentPage
                        ? "bg-blue-600 text-white"
                        : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
