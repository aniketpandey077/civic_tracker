// Generates unique, official-formatted complaint numbers
// Format: CTR-{YEAR}-{CITY_CODE}-{RANDOM_6_DIGIT_SEQUENCE}
// Example: CTR-2026-PHA-849102

export function generateComplaintNumber(cityCode: string = 'JPR', year: number = 2026): string {
  const cleanCity = cityCode ? cityCode.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() : 'JPR';
  const sequence = Math.floor(100000 + Math.random() * 900000);
  return `CTR-${year}-${cleanCity || 'JPR'}-${sequence}`;
}

export function parseComplaintNumber(complaintNumber: string): {
  prefix: string;
  year: string;
  cityCode: string;
  sequence: string;
} | null {
  const parts = complaintNumber.split('-');
  if (parts.length !== 4) return null;
  return {
    prefix: parts[0],
    year: parts[1],
    cityCode: parts[2],
    sequence: parts[3],
  };
}
