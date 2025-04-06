'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { API_BASE_URL } from '@/config/api';
import { motion } from 'framer-motion';

interface DashboardStats {
  resumes_count: number | undefined;
  cover_letters_count: number | undefined;
  job_descriptions_count: number | undefined;
  optimized_documents_count: number | undefined;
  available_credits: number | undefined;
}

const CountSkeleton = () => (
  <span className="skeleton w-32 block bg-transparent">
    <span className="h-7 text-xl font-semibold block opacity-10"></span>
  </span>
);

const CountDisplay = ({ count, singular, plural }: { count: number | undefined, singular: string, plural: string }) => {
  const text = count === undefined || count === 0 
    ? `Keine ${plural}` 
    : count === 1 
      ? `1 ${singular}` 
      : `${count} ${plural}`;

  return (
    <motion.span
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4,
        ease: "easeOut",
        delay: 0.1
      }}
      className="min-w-[8rem] block"
    >
      {text}
    </motion.span>
  );
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" }
};
const fadeIn = {
  initial: { opacity: 0, y: 5 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: "easeOut" }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats>({
    resumes_count: undefined,
    cover_letters_count: undefined,
    job_descriptions_count: undefined,
    optimized_documents_count: undefined,
    available_credits: undefined
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
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
        console.error('Fehler beim Laden der Dashboard-Statistiken:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchStats();
    }
  }, [session]);

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.main 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        
        <motion.h1 
          className="text-3xl font-bold mb-8 text-slate-700"
          variants={fadeInUp}
        >
          Dashboard
        </motion.h1>
        <motion.h3 
          className="text-xl mb-8 text-slate-400"
          variants={fadeIn}
          transition={{ delay: 0.12 }}
        >
          Maximieren Sie Ihre Bewerbungschancen mit KI-optimierten Lebensläufen. Unser intelligentes System analysiert Ihre Dokumente und passt sie automatisch an spezifische Stellenausschreibungen an. Sehen Sie direkt, wie gut Sie zur Stelle passen und welche konkreten Verbesserungen vorgenommen wurden.
        </motion.h3>
        <motion.div 
          className="flex flex-col lg:flex-row justify-start items-stretch gap-4"
          variants={staggerContainer}
        >
          {/* Linke Spalte */}
          <motion.div 
            className="flex flex-col gap-4 w-full lg:w-2/5"
            variants={fadeInUp}
            transition={{ delay: 0.2 }}
          >
            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              variants={staggerContainer}
            >
              {/* Blau */}
              <motion.div 
                variants={fadeInUp}
                transition={{ delay: 0.3 }}
                className="w-full sm:w-1/2"
              >
                <Link href="/resume" className="block h-[200px] bg-blue-200 rounded-xl transform hover:scale-105 transition-all duration-200">
                  <div className="text-blue-800 h-full rounded-xl p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold">
                        {isLoading ? <CountSkeleton /> : (
                          <CountDisplay 
                            count={stats.resumes_count} 
                            singular="Lebenslauf" 
                            plural="Lebensläufe" 
                          />
                        )}
                      </h3>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <motion.p 
                      className="text-blue-800 font-medium mb-2"
                      variants={fadeInUp}
                      transition={{ delay: 0.4 }}
                    >
                      Klicken Sie hier, um einen Lebenslauf zu erstellen
                    </motion.p>
                  </div>
                </Link>
              </motion.div>

              {/* Rot */}
              <motion.div 
                variants={fadeInUp}
                transition={{ delay: 0.4 }}
                className="w-full sm:w-1/2"
              >
                <Link href="/coverletter" className="block h-[200px] bg-red-200 rounded-xl transform hover:scale-105 transition-all duration-200">
                  <div className="bg-red-200 text-red-800 h-full rounded-xl p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold">
                        {isLoading ? <CountSkeleton /> : (
                          <CountDisplay 
                            count={stats.cover_letters_count} 
                            singular="Anschreiben" 
                            plural="Anschreiben" 
                          />
                        )}
                      </h3>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-red-800 font-medium mb-2">
                      Klicken Sie hier, um ein Anschreiben zu erstellen</p>
                  </div>
                </Link>
              </motion.div>
            </motion.div>

            {/* Gelb */}
            <motion.div 
              variants={fadeInUp}
              transition={{ delay: 0.5 }}
            >
              <Link href="/jobs" className="block w-full h-[300px] bg-yellow-100 rounded-xl transform hover:scale-105 transition-all duration-200 order-3 lg:order-none">
                <div className="h-full rounded-xl p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-yellow-700">
                      {isLoading ? <CountSkeleton /> : (
                      <CountDisplay 
                      count={stats.job_descriptions_count} 
                      singular="Stellenausschreibung" 
                      plural="Stellenausschreibungen" 
                    />
                      )}
                    </h3>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-yellow-700 font-medium mb-2">
                  Fügen Sie hier Ihre Stellenausschreibungen hinzu</p>
                </div>
              </Link>
            </motion.div>
          </motion.div>

          {/* Mittlere Spalte */}
          <motion.div 
            className="w-full lg:w-2/5 order-2 lg:order-none"
            variants={fadeInUp}
            transition={{ delay: 0.6 }}
          >
            <Link href="/optimized" className="block h-[250px] lg:h-full bg-green-200 rounded-xl transform hover:scale-105 transition-all duration-200">
              <div className="bg-green-200 text-green-800 h-full rounded-xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold">
                    {isLoading ? <CountSkeleton /> : (
                      <CountDisplay 
                      count={stats.optimized_documents_count} 
                      singular="Optimiertes Dokument" 
                      plural="Optimierte Dokumente" 
                    />
                    )}
                  </h3>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-green-800 font-medium mb-2">
                    Hier finden Sie Ihre KI-optimierten Dokumente</p>
              </div>
            </Link>
          </motion.div>

          {/* Rechte Spalte */}
          <motion.div 
            className="flex flex-col gap-6 w-full lg:w-1/5 order-4 lg:order-none"
            variants={fadeInUp}
            transition={{ delay: 0.7 }}
          >
            <motion.div variants={fadeInUp} transition={{ delay: 0.8 }}>
              <Link href="/credits" className="block w-full h-[300px] text-lime-800 bg-lime-100 rounded-xl transform hover:scale-105 transition-all duration-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold">{isLoading ? <CountSkeleton /> : (
                    <CountDisplay 
                      count={stats.available_credits} 
                      singular="Credit" 
                      plural="Credits" 
                    />
                  )}</h3>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-lime-800 font-medium mb-2">Kaufen Sie Credits für weitere Optimierungen</div>
              </Link>
            </motion.div>
            <motion.div 
              variants={fadeInUp}
              transition={{ delay: 0.9 }}
              className="w-full h-[200px] bg-slate-100 text-slate-500 rounded-xl p-6 transform hover:scale-105 transition-all duration-200"
            >
              <div className="flex justify-between items-start mb-4 text-slate-500">
                <h3 className="text-xl font-semibold ">Coming Soon</h3>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <p className="text-slate-500 font-medium">Neue Features in Entwicklung</p>
              <p className="text-slate-500 text-sm mt-2">Bleiben Sie gespannt auf weitere Funktionen</p>
            </motion.div>
          </motion.div>
        </motion.div>
        
      </motion.main>
    </div>
  );
} 