'use client';

import HomePageClient from '@/components/HomePageClient';

// This forces the page to be rendered dynamically on the server for every request.
// It prevents Next.js from serving a stale, statically cached version of the homepage.
export const dynamic = 'force-dynamic';

export default function HomePage() {
  return <HomePageClient />;
}
