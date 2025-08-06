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

interface AdvocatesTableProps {
  advocates: Advocate[];
}

export default function AdvocatesTable({ advocates }: AdvocatesTableProps) {
  return (
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
            {advocates.map((advocate, index) => {
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
        {advocates.map((advocate, index) => (
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
  );
} 