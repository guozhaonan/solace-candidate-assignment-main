"use client";

import { useEffect, useState } from "react";
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

export default function Home() {
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [filteredAdvocates, setFilteredAdvocates] = useState<Advocate[]>([]);

  useEffect(() => {
    console.log("fetching advocates...");
    fetch("/api/advocates").then((response) => {
      response.json().then((jsonResponse) => {
        setAdvocates(jsonResponse.data);
        setFilteredAdvocates(jsonResponse.data);
      });
    });
  }, []);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value;

    const searchTermElement = document.getElementById("search-term");
    if (searchTermElement) {
      searchTermElement.innerHTML = searchTerm;
    }

    console.log("filtering advocates...");
    const filteredAdvocates = advocates.filter((advocate) => {
      return (
        advocate.firstName.includes(searchTerm) ||
        advocate.lastName.includes(searchTerm) ||
        advocate.city.includes(searchTerm) ||
        advocate.degree.includes(searchTerm) ||
        advocate.specialties.some(specialty => specialty.includes(searchTerm)) ||
        advocate.yearsOfExperience.toString().includes(searchTerm)
      );
    });

    setFilteredAdvocates(filteredAdvocates);
  };

  const onClick = () => {
    console.log(advocates);
    setFilteredAdvocates(advocates);
  };

  return (
    <main className="m-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Solace Advocates</h1>
      <div className="mb-8">
        <p className="text-lg font-medium text-gray-700 mb-2">Search</p>
        <p className="text-sm text-gray-600 mb-4">
          Searching for: <span id="search-term" className="font-medium text-gray-900"></span>
        </p>
        <div className="flex gap-4 items-center">
          <input 
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search advocates..."
            onChange={onChange} 
          />
          <button 
            onClick={onClick}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
          >
            Reset Search
          </button>
        </div>
      </div>
      {filteredAdvocates.length === 0 ? (
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
    </main>
  );
}
