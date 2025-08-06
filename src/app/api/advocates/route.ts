import db from "../../../db";
import { advocates } from "../../../db/schema";
import { advocateData } from "../../../db/seed/advocates";

interface SearchParams {
  searchTerm?: string;
  page?: number;
  limit?: number;
  specialties?: string[];
  city?: string;
  degree?: string;
  experienceLevel?: string;
}

export async function POST(request: Request) {
  try {
    const body: SearchParams = await request.json();
    const {
      searchTerm = "",
      page = 1,
      limit = 10,
      specialties = [],
      city = "",
      degree = "",
      experienceLevel = ""
    } = body;

    // Filter advocates based on search criteria
    let filteredData = advocateData.filter((advocate) => {
      const matchesSearchTerm = !searchTerm || 
        advocate.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        advocate.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        advocate.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        advocate.degree.toLowerCase().includes(searchTerm.toLowerCase()) ||
        advocate.specialties.some(specialty => 
          specialty.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        advocate.yearsOfExperience.toString().includes(searchTerm);

      const matchesCity = !city || advocate.city.toLowerCase().includes(city.toLowerCase());
      const matchesDegree = !degree || advocate.degree.toLowerCase().includes(degree.toLowerCase());
      
      const matchesSpecialties = specialties.length === 0 || 
        specialties.every(specialty => 
          advocate.specialties.some(advocateSpecialty => 
            advocateSpecialty.toLowerCase().includes(specialty.toLowerCase())
          )
        );

      const matchesExperience = !experienceLevel || (() => {
        switch (experienceLevel) {
          case "emerging":
            return advocate.yearsOfExperience >= 0 && advocate.yearsOfExperience <= 3;
          case "established":
            return advocate.yearsOfExperience >= 4 && advocate.yearsOfExperience <= 7;
          case "expert":
            return advocate.yearsOfExperience >= 8;
          default:
            return true;
        }
      })();

      return matchesSearchTerm && matchesCity && matchesDegree && matchesSpecialties && matchesExperience;
    });

    // Calculate pagination
    const totalCount = filteredData.length;
    const totalPages = Math.ceil(totalCount / limit);
    const offset = (page - 1) * limit;
    const paginatedData = filteredData.slice(offset, offset + limit);

    return Response.json({
      data: paginatedData,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });
  } catch (error) {
    return Response.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
