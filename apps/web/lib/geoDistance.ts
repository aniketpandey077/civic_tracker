import { CivicIssue } from './types';

/**
 * Calculates the exact geodesic distance between two sets of GPS coordinates (in meters)
 * using the Haversine formula.
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Radius of Earth in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export interface NearbyIssueMatch {
  issue: CivicIssue;
  distanceMeters: number;
}

/**
 * Checks all active complaints in the platform to find if any registered issue exists
 * within the specified radius threshold (default 50 meters).
 */
export function findNearbyExistingIssue(
  userLat: number,
  userLng: number,
  issues: CivicIssue[],
  thresholdMeters: number = 50
): NearbyIssueMatch | null {
  let closestMatch: NearbyIssueMatch | null = null;

  for (const issue of issues) {
    // Only check active/non-resolved issues or recently reported issues
    if (issue.status === 'resolved') continue;

    const distance = calculateDistanceMeters(userLat, userLng, issue.latitude, issue.longitude);
    if (distance <= thresholdMeters) {
      if (!closestMatch || distance < closestMatch.distanceMeters) {
        closestMatch = { issue, distanceMeters: distance };
      }
    }
  }

  return closestMatch;
}
