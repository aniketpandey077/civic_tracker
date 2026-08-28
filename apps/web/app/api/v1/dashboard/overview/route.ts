import { NextResponse } from 'next/server';
import { getDashboardMetrics } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const metrics = getDashboardMetrics();
  return NextResponse.json({
    success: true,
    data: metrics,
  });
}
