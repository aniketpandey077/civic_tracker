import type { Metadata } from 'next';
import './globals.css';
import dynamic from 'next/dynamic';
import { AuthProvider } from '@/lib/authContext';
import { ThemeProvider } from '@/lib/themeContext';

// Both Navbar and Footer use useUserLocation (geolocation + localStorage).
// ssr: false means they are never server-rendered → eliminates hydration mismatches.
const Navbar = dynamic(() => import('@/components/Navbar'), { ssr: false });
const Footer = dynamic(() => import('@/components/Footer'), { ssr: false });

export const metadata: Metadata = {
  title: 'CIVICTRACK — Municipal Infrastructure Grievance & Accountability System',
  description: 'Official municipal civic defect registry featuring YOLOv8 edge computer vision, ward-level PostGIS routing, 15-day SLA compliance tracking, and citizen-verified evidence closure.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="bg-[#F0EEE9] dark:bg-[#0B0F19] text-[#1E2328] dark:text-[#F8FAFC] antialiased font-sans min-h-screen transition-colors duration-200">
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {children}
            </main>
            <Footer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
