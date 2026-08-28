import { NextRequest, NextResponse } from 'next/server';
import { getStoredIssues } from '@/lib/store';
import { getDistanceMeters } from '@/lib/zoneMatcher';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') || '26.9068');
  const lng = parseFloat(searchParams.get('lng') || '75.7873');
  const radius = parseFloat(searchParams.get('radius') || '1000');

  const issues = getStoredIssues();
  const nearby = issues.filter(issue => {
    if (issue.status === 'resolved') return false;
    const dist = getDistanceMeters(lat, lng, issue.latitude, issue.longitude);
    return dist <= radius;
  });

  return NextResponse.json({
    success: true,
    data: nearby,
    radius_meters: radius,
    center: { lat, lng },
  });
}
