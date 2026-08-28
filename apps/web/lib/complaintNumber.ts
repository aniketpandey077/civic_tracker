// Generates unique, official-formatted complaint numbers
// Format: CTR-{YEAR}-{CITY_CODE}-{ZERO_PADDED_SEQUENCE}
// Example: CTR-2026-JPR-000184

let counter = 184;

export function generateComplaintNumber(cityCode: string = 'JPR', year: number = 2026): string {
  counter += 1;
  const padded = String(counter).padStart(6, '0');
  return `CTR-${year}-${cityCode.toUpperCase()}-${padded}`;
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
