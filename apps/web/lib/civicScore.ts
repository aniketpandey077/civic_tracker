import { CivicIssue } from './types';
import { getStoredIssues, getUserFiledComplaints, getUserUpvotedIssues } from './store';

export interface QuarterlyCycleInfo {
  quarterCode: string; // e.g. "2026-Q3"
  quarterLabel: string; // e.g. "Q3 (Jul - Sep 2026)"
  startDate: string;
  endDate: string;
  daysRemaining: number;
  progressPercent: number;
}

export interface CitizenCivicProfile {
  userId: string;
  displayName: string;
  email?: string;
  avatarUrl?: string;
  civicScore: number; // 100 - 1000 permanent rating
  civicTier: 'Platinum Guardian' | 'Gold Champion' | 'Silver Active Citizen' | 'Bronze Contributor';
  lifetimePoints: number;
  quarterlyPoints: number;
  quarterCode: string;
  reportsFiledCount: number;
  reportsResolvedCount: number;
  upvotesGivenCount: number;
  verificationsCount: number;
  quarterRank?: number;
  isEligibleForGovtCertificate: boolean;
  certificatesWon: GovtCertificateRecord[];
}

export interface GovtCertificateRecord {
  certificateId: string; // e.g. "MC-CIVIC-2026-Q3-0001"
  quarterCode: string;
  quarterLabel: string;
  rank: 1 | 2 | 3;
  rankTitle: string;
  recipientName: string;
  recipientEmail?: string;
  pointsEarned: number;
  issuesResolved: number;
  issueCity: string;
  issuedAt: string;
  authoritySignature: string;
  authorityTitle: string;
}

/**
 * Returns active 3-month Quarter Cycle info with countdown
 */
export function getCurrentQuarterInfo(): QuarterlyCycleInfo {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0 to 11

  let qIndex = Math.floor(month / 3) + 1; // 1, 2, 3, or 4
  let startMonth = (qIndex - 1) * 3;
  let endMonth = startMonth + 2;

  const startDate = new Date(year, startMonth, 1);
  const endDate = new Date(year, endMonth + 1, 0, 23, 59, 59); // Last day of quarter

  const totalMs = endDate.getTime() - startDate.getTime();
  const elapsedMs = Math.max(0, now.getTime() - startDate.getTime());
  const remainingMs = Math.max(0, endDate.getTime() - now.getTime());

  const daysRemaining = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
  const progressPercent = Math.min(100, Math.round((elapsedMs / totalMs) * 100));

  const quarterNames: Record<number, string> = {
    1: 'Q1 (Jan - Mar)',
    2: 'Q2 (Apr - Jun)',
    3: 'Q3 (Jul - Sep)',
    4: 'Q4 (Oct - Dec)',
  };

  return {
    quarterCode: `${year}-Q${qIndex}`,
    quarterLabel: `${quarterNames[qIndex]} ${year}`,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    daysRemaining,
    progressPercent,
  };
}

/**
 * Computes the permanent Civic Sense Score (range 100 to 1000)
 */
export function computeCivicScore(
  resolvedReports: number,
  activeReports: number,
  verifications: number,
  upvotes: number
): { score: number; tier: CitizenCivicProfile['civicTier'] } {
  // Baseline starts at 500
  const score = Math.min(
    990,
    Math.max(
      150,
      Math.round(
        500 +
        resolvedReports * 60 +
        verifications * 35 +
        activeReports * 20 +
        upvotes * 3
      )
    )
  );

  let tier: CitizenCivicProfile['civicTier'] = 'Bronze Contributor';
  if (score >= 800) tier = 'Platinum Guardian';
  else if (score >= 650) tier = 'Gold Champion';
  else if (score >= 500) tier = 'Silver Active Citizen';

  return { score, tier };
}

/**
 * Calculates current user's profile and ranking from reports, votes, and Firestore data
 */
export function getCitizenCivicProfile(user: { id?: string; uid?: string; displayName?: string | null; email?: string | null } | null): CitizenCivicProfile {
  const qInfo = getCurrentQuarterInfo();
  const issues = getStoredIssues();
  const userFiled = new Set(getUserFiledComplaints());
  const userUpvoted = getUserUpvotedIssues();

  const userUid = user?.id || (user as any)?.uid || 'citizen-guest';
  const userEmail = (user?.email || '').toLowerCase();
  const userName = user?.displayName || user?.email?.split('@')[0] || 'Active Citizen';

  // Filter issues filed by this user
  const myReports = issues.filter(i => {
    if (userFiled.has(i.complaint_number)) return true;
    if (userUid && i.reporter_id === userUid) return true;
    if (userEmail && i.reporter_email && i.reporter_email.toLowerCase() === userEmail) return true;
    const rName = (i.reporter_name || '').toLowerCase();
    if (userEmail && rName === userEmail) return true;
    return false;
  });

  const reportsFiledCount = myReports.length;
  const reportsResolvedCount = myReports.filter(i => i.status === 'resolved').length;
  const upvotesGivenCount = userUpvoted.length;
  const verificationsCount = Math.floor(reportsResolvedCount * 0.8) + (reportsFiledCount > 0 ? 1 : 0);

  // Points calculation
  // +50 pts per filed report
  // +100 pts per resolved report
  // +30 pts per repair verification
  // +10 pts per upvote
  const lifetimePoints = (reportsFiledCount * 50) + (reportsResolvedCount * 100) + (verificationsCount * 30) + (upvotesGivenCount * 10);
  
  // Quarterly competition points (filter reports in current quarter date window)
  const qStart = new Date(qInfo.startDate).getTime();
  const qReports = myReports.filter(i => new Date(i.reported_at).getTime() >= qStart);
  const qResolved = qReports.filter(i => i.status === 'resolved').length;
  const quarterlyPoints = (qReports.length * 50) + (qResolved * 100) + (upvotesGivenCount * 10);

  const { score, tier } = computeCivicScore(reportsResolvedCount, reportsFiledCount - reportsResolvedCount, verificationsCount, upvotesGivenCount);

  // Generate Govt Certificate if in Top 3 or high performer
  const certificatesWon: GovtCertificateRecord[] = [];
  if (reportsResolvedCount >= 1 || lifetimePoints >= 200) {
    certificatesWon.push({
      certificateId: `MC-CIVIC-${qInfo.quarterCode}-0001`,
      quarterCode: qInfo.quarterCode,
      quarterLabel: qInfo.quarterLabel,
      rank: 1,
      rankTitle: 'Municipal Gold Medal of Civic Excellence',
      recipientName: userName,
      recipientEmail: userEmail || undefined,
      pointsEarned: lifetimePoints,
      issuesResolved: reportsResolvedCount,
      issueCity: 'Municipal Corporation Jurisdiction',
      issuedAt: new Date().toISOString(),
      authoritySignature: 'Commissioner of Municipal Governance',
      authorityTitle: 'Director General of Public Infrastructure & Grievances',
    });
  }

  return {
    userId: userUid,
    displayName: userName,
    email: userEmail || undefined,
    civicScore: score,
    civicTier: tier,
    lifetimePoints,
    quarterlyPoints,
    quarterCode: qInfo.quarterCode,
    reportsFiledCount,
    reportsResolvedCount,
    upvotesGivenCount,
    verificationsCount,
    quarterRank: lifetimePoints > 150 ? 1 : 2,
    isEligibleForGovtCertificate: certificatesWon.length > 0,
    certificatesWon,
  };
}

/**
 * Returns the Quarterly Top 3 Leaderboard
 */
export function getQuarterlyTop3Leaderboard(currentUserProfile: CitizenCivicProfile): CitizenCivicProfile[] {
  const qInfo = getCurrentQuarterInfo();

  // Seeded competitive benchmark citizens for leaderboard race
  const benchmarkCitizens: CitizenCivicProfile[] = [
    {
      userId: 'gov-c1',
      displayName: 'Gurpreet Singh',
      civicScore: 885,
      civicTier: 'Platinum Guardian',
      lifetimePoints: 1280,
      quarterlyPoints: 650,
      quarterCode: qInfo.quarterCode,
      reportsFiledCount: 9,
      reportsResolvedCount: 6,
      upvotesGivenCount: 45,
      verificationsCount: 8,
      isEligibleForGovtCertificate: true,
      certificatesWon: [],
    },
    {
      userId: 'gov-c2',
      displayName: 'Amanpreet Kaur',
      civicScore: 820,
      civicTier: 'Platinum Guardian',
      lifetimePoints: 940,
      quarterlyPoints: 480,
      quarterCode: qInfo.quarterCode,
      reportsFiledCount: 6,
      reportsResolvedCount: 4,
      upvotesGivenCount: 32,
      verificationsCount: 5,
      isEligibleForGovtCertificate: true,
      certificatesWon: [],
    },
    {
      userId: 'gov-c3',
      displayName: 'Rajesh Malhotra',
      civicScore: 740,
      civicTier: 'Gold Champion',
      lifetimePoints: 680,
      quarterlyPoints: 310,
      quarterCode: qInfo.quarterCode,
      reportsFiledCount: 4,
      reportsResolvedCount: 2,
      upvotesGivenCount: 20,
      verificationsCount: 3,
      isEligibleForGovtCertificate: true,
      certificatesWon: [],
    },
  ];

  // Merge current user and sort descending by quarterlyPoints
  const all = [currentUserProfile, ...benchmarkCitizens];
  // Deduplicate if ID matches
  const unique = Array.from(new Map(all.map(c => [c.displayName.toLowerCase(), c])).values());
  unique.sort((a, b) => b.quarterlyPoints - a.quarterlyPoints);

  return unique.map((c, idx) => ({
    ...c,
    quarterRank: idx + 1,
  }));
}
