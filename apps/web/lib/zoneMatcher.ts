import { AdminZone } from './types';

export const ADMIN_ZONES: AdminZone[] = [
  {
    id: 'a1111111-1111-1111-1111-111111111111',
    zone_name: 'Ward 12 (Civil Lines)',
    department: 'Public Works Department (PWD)',
    city: 'Jaipur',
    city_code: 'JPR',
    official_handle: '@Jaipur_PWD_Official',
    center: [26.9068, 75.7873],
    boundary: [
      [
        [75.775, 26.898],
        [75.800, 26.898],
        [75.800, 26.915],
        [75.775, 26.915],
        [75.775, 26.898]
      ]
    ]
  },
  {
    id: 'a2222222-2222-2222-2222-222222222222',
    zone_name: 'Ward 15 (Malviya Nagar)',
    department: 'Solid Waste Management (SWM)',
    city: 'Jaipur',
    city_code: 'JPR',
    official_handle: '@Jaipur_SWM_Zone',
    center: [26.8528, 75.8237],
    boundary: [
      [
        [75.810, 26.840],
        [75.838, 26.840],
        [75.838, 26.865],
        [75.810, 26.865],
        [75.810, 26.840]
      ]
    ]
  },
  {
    id: 'a3333333-3333-3333-3333-333333333333',
    zone_name: 'Ward 22 (Mansarovar)',
    department: 'Jaipur Vidyut Vitaran (JVVNL)',
    city: 'Jaipur',
    city_code: 'JPR',
    official_handle: '@JVVNL_Mansarovar',
    center: [26.8642, 75.7675],
    boundary: [
      [
        [75.750, 26.850],
        [75.785, 26.850],
        [75.785, 26.878],
        [75.750, 26.878],
        [75.750, 26.850]
      ]
    ]
  },
  {
    id: 'a4444444-4444-4444-4444-444444444444',
    zone_name: 'Ward 8 (Vaishali Nagar)',
    department: 'Public Health Engineering (PHED)',
    city: 'Jaipur',
    city_code: 'JPR',
    official_handle: '@PHED_JaipurWest',
    center: [26.9124, 75.7412],
    boundary: [
      [
        [75.725, 26.900],
        [75.755, 26.900],
        [75.755, 26.925],
        [75.725, 26.925],
        [75.725, 26.900]
      ]
    ]
  },
  {
    id: 'a5555555-5555-5555-5555-555555555555',
    zone_name: 'Ward 30 (Sanganer)',
    department: 'Municipal Drainage & Sewerage',
    city: 'Jaipur',
    city_code: 'JPR',
    official_handle: '@Jaipur_Drainage',
    center: [26.8184, 75.7769],
    boundary: [
      [
        [75.760, 26.800],
        [75.795, 26.800],
        [75.795, 26.835],
        [75.760, 26.835],
        [75.760, 26.800]
      ]
    ]
  }
];

// Point in Polygon algorithm (Ray-casting)
function isPointInPolygon(point: [number, number], polygon: number[][]): boolean {
  const [lng, lat] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    const intersect = ((yi > lat) !== (yj > lat)) &&
      (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// Calculate Haversine distance in meters
export function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in metres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export interface RealGeoAddress {
  road?: string;
  suburb?: string;
  neighbourhood?: string;
  city?: string;
  town?: string;
  state?: string;
  display_name?: string;
  ward_name: string;
  department: string;
  city_code: string;
}

// Real-time reverse geocoding using OpenStreetMap Nominatim
export async function reverseGeocodeReal(latitude: number, longitude: number): Promise<RealGeoAddress> {
  // First check if within configured Jaipur wards
  for (const zone of ADMIN_ZONES) {
    if (zone.boundary && zone.boundary[0]) {
      if (isPointInPolygon([longitude, latitude], zone.boundary[0])) {
        return {
          ward_name: zone.zone_name,
          city: zone.city,
          department: zone.department,
          city_code: zone.city_code,
          display_name: `${zone.zone_name}, ${zone.city}`,
        };
      }
    }
  }

  // If outside polygon or in user's real physical city, fetch real OSM address
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      {
        headers: { 'Accept-Language': 'en' },
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};

      const road = addr.road || addr.street || '';
      const suburb = addr.suburb || addr.neighbourhood || addr.residential || addr.subdistrict || '';
      const city = addr.city || addr.town || addr.municipality || addr.district || addr.county || 'Local Area';
      const state = addr.state || '';

      const locationLabel = suburb ? `${suburb}, ${city}` : road ? `${road}, ${city}` : city;
      const cityCode = (city.slice(0, 3) || 'LOC').toUpperCase();

      return {
        road,
        suburb,
        city,
        state,
        display_name: data.display_name,
        ward_name: `Ward (${locationLabel})`,
        department: `Municipal Corporation (${city})`,
        city_code: cityCode,
      };
    }
  } catch (err) {
    console.warn('OSM reverse geocoding note:', err);
  }

  // Heuristic coordinate fallback
  return {
    ward_name: `Local Ward (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`,
    city: 'Municipal Zone',
    department: 'Public Works & Sanitation',
    city_code: 'LOC',
  };
}

// Synchronous Matcher with smart dynamic naming
export function matchZoneByCoordinates(latitude: number, longitude: number): AdminZone {
  for (const zone of ADMIN_ZONES) {
    if (zone.boundary && zone.boundary[0]) {
      if (isPointInPolygon([longitude, latitude], zone.boundary[0])) {
        return zone;
      }
    }
  }

  // Check distance to Jaipur
  const distToJaipur = getDistanceMeters(latitude, longitude, 26.9068, 75.7873);
  if (distToJaipur > 45000) {
    // User is in a different city / region (e.g. Punjab, Delhi, etc.)
    return {
      id: `zone-dynamic-${Math.round(latitude * 100)}-${Math.round(longitude * 100)}`,
      zone_name: `Local Municipal Ward (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
      department: 'Municipal Corporation (Roads & Sanitation)',
      city: 'Local City',
      city_code: 'LOC',
      official_handle: '@Municipal_Ward_Desk',
      center: [latitude, longitude],
    };
  }

  // Within Jaipur metro area: return nearest ward
  let nearestZone = ADMIN_ZONES[0];
  let minDistance = Infinity;

  for (const zone of ADMIN_ZONES) {
    const dist = getDistanceMeters(latitude, longitude, zone.center[0], zone.center[1]);
    if (dist < minDistance) {
      minDistance = dist;
      nearestZone = zone;
    }
  }

  return nearestZone;
}
