"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import SearchDescription from "../components/SearchDescription";
import AdvocatesTable from "../components/AdvocatesTable";
import Pagination from "../components/Pagination";
import Filters from "../components/Filters";

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
    
    fetch("/api/advocates", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        page: 1,
        limit: 10
      }),
    }).then((response) => {
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

  const handleFilterChange = (filterType: string, value: string | string[] | boolean) => {
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
    fetch("/api/advocates", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        page: 1,
        limit: 10
      }),
    }).then((response) => {
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
        <SearchDescription filters={filters} />
        
        <Filters 
          filters={filters}
          onFilterChange={handleFilterChange}
          onDropdownToggle={(isOpen) => setFilters(prev => ({ ...prev, specialtiesDropdownOpen: isOpen }))}
          onReset={onClickReset}
        />
      </div>

      {isLoading ? (
        <LoadingState />
      ) : filteredAdvocates.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <AdvocatesTable advocates={filteredAdvocates} />
          <Pagination pagination={pagination} onPageChange={handlePageChange} />
        </>
      )}
    </main>
  );
}
