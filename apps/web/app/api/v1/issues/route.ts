import { NextRequest, NextResponse } from 'next/server';
import { getStoredIssues, addIssue } from '@/lib/store';
import { matchZoneByCoordinates } from '@/lib/zoneMatcher';
import { generateComplaintNumber } from '@/lib/complaintNumber';
import { CivicIssue } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const status = searchParams.get('status');
  const zoneId = searchParams.get('zone');

  let issues = getStoredIssues();

  if (category && category !== 'all') {
    issues = issues.filter(i => i.category === category);
  }
  if (status && status !== 'all') {
    issues = issues.filter(i => i.status === status);
  }
  if (zoneId && zoneId !== 'all') {
    issues = issues.filter(i => i.zone_id === zoneId);
  }

  return NextResponse.json({
    success: true,
    data: issues,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { photo_url, category, description, title, latitude, longitude, ai_confidence, ai_detected_class } = body;

    if (!photo_url || !category || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields (photo_url, category, latitude, longitude)' },
        { status: 400 }
      );
    }

    const zone = matchZoneByCoordinates(latitude, longitude);
    const complaintNumber = generateComplaintNumber(zone.city_code, 2026);
    const now = new Date();
    const deadline = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);

    const newIssue: CivicIssue = {
      id: `issue-${Date.now()}`,
      complaint_number: complaintNumber,
      reporter_name: 'Citizen Reporter',
      zone_id: zone.id,
      zone_name: zone.zone_name,
      department: zone.department,
      category,
      title: title || `${category.toUpperCase()} Issue at ${zone.zone_name}`,
      description: description || 'Civic defect reported via live camera.',
      photo_url,
      ai_confidence: ai_confidence || 0.94,
      ai_detected_class: ai_detected_class || 'Civic Infrastructure Defect',
      latitude,
      longitude,
      status: 'pending',
      upvote_count: 1,
      reported_at: now.toISOString(),
      deadline_at: deadline.toISOString(),
      escalated: false,
    };

    const saved = addIssue(newIssue);

    return NextResponse.json({
      success: true,
      data: saved,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
