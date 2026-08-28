import { NextRequest, NextResponse } from 'next/server';
import { getStoredIssues } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  let issues = getStoredIssues();
  if (category && category !== 'all') {
    issues = issues.filter(i => i.category === category);
  }

  const heatmapData = issues.map(i => {
    let weight = 0.5;
    if (i.status !== 'resolved') {
      const isOverdue = new Date(i.deadline_at).getTime() < Date.now();
      weight = isOverdue ? 1.0 : 0.7;
    } else {
      weight = 0.2;
    }
    return {
      lat: i.latitude,
      lng: i.longitude,
      weight,
      category: i.category,
      status: i.status,
    };
  });

  return NextResponse.json({
    success: true,
    data: heatmapData,
  });
}
