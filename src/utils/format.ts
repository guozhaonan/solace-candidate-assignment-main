/**
 * Formats a phone number to (555) 555-5555 format
 * @param phoneNumber - The phone number as a number or string
 * @returns Formatted phone number string or null if invalid
 */
export function formatPhoneNumber(phoneNumber: number | string): string | null {
  // Convert to string and remove any non-digit characters
  const cleanNumber = phoneNumber.toString().replace(/\D/g, '');
  
  // Check if we have exactly 10 digits
  if (cleanNumber.length !== 10) {
    return null;
  }
  
  // Split the number into parts and format
  const areaCode = cleanNumber.slice(0, 3);
  const prefix = cleanNumber.slice(3, 6);
  const lineNumber = cleanNumber.slice(6, 10);
  
  return `(${areaCode}) ${prefix}-${lineNumber}`;
} 