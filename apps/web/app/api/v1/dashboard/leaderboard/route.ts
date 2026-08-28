import { NextResponse } from 'next/server';
import { getAccountabilityLeaderboard, getPerformanceLeaderboard } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const accountability = getAccountabilityLeaderboard();
  const performance = getPerformanceLeaderboard();

  return NextResponse.json({
    success: true,
    data: {
      accountability,
      performance,
    },
  });
}
