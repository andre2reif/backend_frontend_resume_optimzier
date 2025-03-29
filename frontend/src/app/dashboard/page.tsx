'use client';

import { useEffect, useState, useCallback } from 'react';
import LayoutMain from '@/components/layout/LayoutMain';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { API_BASE_URL } from '@/config/api';

interface Stats {
  resumes_count: number;
  job_descriptions_count: number;
  optimized_resumes_count: number;
  cover_letters_count: number;
  available_credits: number;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats>({
    resumes_count: 0,
    job_descriptions_count: 0,
    optimized_resumes_count: 0,
    cover_letters_count: 0,
    available_credits: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!session?.user?.email) return;

    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/v1/user/stats?user_id=${encodeURIComponent(session.user.email)}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.email]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (!session) {
    return (
      <LayoutMain>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Bitte melden Sie sich an</h1>
            <Link
              href="/auth/signin"
              className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Anmelden
            </Link>
          </div>
        </div>
      </LayoutMain>
    );
  }

  return (
    <LayoutMain>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        
        <div className="max-w-3xl mx-auto text-center mb-12">
          <p className="text-gray-600">
            Maximieren Sie Ihre Bewerbungschancen mit KI-optimierten Lebensläufen.
            Unser intelligentes System analysiert Ihre Dokumente und passt sie automatisch
            an spezifische Stellenausschreibungen an. Sehen Sie direkt, wie gut Sie zur
            Stelle passen und welche konkreten Verbesserungen vorgenommen wurden.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Lebensläufe Card */}
          <Link href="/resume" className="block">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Lebensläufe</h3>
              <p className="text-4xl font-bold text-blue-600">
                {isLoading ? <span className="loading loading-spinner loading-sm"></span> : stats.resumes_count}
              </p>
              <p className="text-sm text-gray-500 mt-2">Lebenslauf hochladen</p>
            </div>
          </Link>

          {/* Stellenbeschreibung Card */}
          <Link href="/jobdescription" className="block">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Stellenbeschreibung</h3>
              <p className="text-4xl font-bold text-green-600">
                {isLoading ? <span className="loading loading-spinner loading-sm"></span> : stats.job_descriptions_count}
              </p>
              <p className="text-sm text-gray-500 mt-2">Stellenbeschreibung hinzufügen</p>
            </div>
          </Link>

          {/* Optimierte Lebensläufe Card */}
          <Link href="/optimized" className="block">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Optimierte Lebensläufe</h3>
              <p className="text-4xl font-bold text-purple-600">
                {isLoading ? <span className="loading loading-spinner loading-sm"></span> : stats.optimized_resumes_count}
              </p>
              <p className="text-sm text-gray-500 mt-2">Lebenslauf optimieren</p>
            </div>
          </Link>

          {/* Credits Card */}
          <Link href="/credits" className="block">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Credits & Abrechnung</h3>
              <p className="text-4xl font-bold text-orange-600">
                {isLoading ? <span className="loading loading-spinner loading-sm"></span> : stats.available_credits}
              </p>
              <p className="text-sm text-gray-500 mt-2">Verfügbare Credits</p>
            </div>
          </Link>
        </div>
      </div>
    </LayoutMain>
  );
} 