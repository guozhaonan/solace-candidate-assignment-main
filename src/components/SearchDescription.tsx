interface SearchDescriptionProps {
  filters: {
    city: string;
    degree: string;
    specialties: string[];
    experienceLevel: string;
  };
}

export default function SearchDescription({ filters }: SearchDescriptionProps) {
  const getSearchDescription = () => {
    const activeFilters = [];
    let advocatePrefix = "advocates";
    
    // Handle experience level as adjective
    if (filters.experienceLevel) {
      const levelText = {
        emerging: "Emerging (0-3 years of experience)",
        established: "Established (4-7 years of experience)", 
        expert: "Expert (8+ years of experience)"
      }[filters.experienceLevel];
      advocatePrefix = `${levelText} advocates`;
    }
    
    if (filters.city) activeFilters.push(`in ${filters.city}`);
    if (filters.degree) activeFilters.push(`with ${filters.degree} degree`);
    if (filters.specialties.length > 0) {
      activeFilters.push(`specializing in ${filters.specialties.join(", ")}`);
    }
    
    if (activeFilters.length === 0 && !filters.experienceLevel) {
      return "Showing all advocates";
    }
    
    return `Showing ${advocatePrefix} ${activeFilters.join(" ")}`;
  };

  return (
    <p className="text-sm text-gray-600 mb-4">
      {getSearchDescription()}
    </p>
  );
} 