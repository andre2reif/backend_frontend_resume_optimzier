'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { coverletterApi } from '@/lib/api';
import { Coverletter, CoverletterAnalysis } from '@/types/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { CoverletterAnalysisResults } from '@/components/CoverletterAnalysisResults';

export default function AnalyzeCoverletterPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [coverletter, setCoverletter] = useState<Coverletter | null>(null);
  const [analysis, setAnalysis] = useState<CoverletterAnalysis | null>(null);
  const [jobdescription, setjobdescription] = useState('');

  useEffect(() => {
    const fetchCoverletter = async () => {
      try {
        const response = await coverletterApi.getById(params.id);
        setCoverletter(response.data.data);
      } catch (error) {
        toast.error('Fehler beim Laden des Lebenslaufs');
        router.push('/coverletter');
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchCoverletter();
    }
  }, [session, params.id, router]);

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-base-content">Bitte melden Sie sich an</h1>
          <Link
            href="/auth/signin"
            className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90"
          >
            Anmelden
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (!coverletter) {
    return null;
  }

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);

    try {
      const response = await coverletterApi.analyze(params.id, jobdescription);
      setAnalysis(response.data.data);
      toast.success('Analyse erfolgreich abgeschlossen');
    } catch (error) {
      toast.error('Fehler bei der Analyse des Lebenslaufs');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-base-content">Lebenslauf analysieren</h1>
          <p className="mt-2 text-sm text-base-content/80">
            Analysieren Sie Ihren Lebenslauf im Hinblick auf eine spezifische Stellenausschreibung.
          </p>
        </div>
      </div>

      <form onSubmit={handleAnalyze} className="mt-8 space-y-6">
        <div>
          <label htmlFor="jobdescription" className="block text-sm font-medium text-base-content">
            Stellenausschreibung
          </label>
          <div className="mt-1">
            <textarea
              name="jobdescription"
              id="jobdescription"
              rows={10}
              required
              value={jobdescription}
              onChange={(e) => setjobdescription(e.target.value)}
              className="block w-full rounded-md border-base-content/20 bg-base-100 px-3 py-2 text-base-content shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
              placeholder="Fügen Sie hier die Stellenausschreibung ein..."
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md border border-base-content/20 bg-base-100 px-4 py-2 text-sm font-semibold text-base-content shadow-sm hover:bg-base-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            disabled={isAnalyzing}
            className="inline-flex justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <div className="loading loading-spinner loading-sm mr-2"></div>
                Wird analysiert...
              </>
            ) : (
              'Lebenslauf analysieren'
            )}
          </button>
        </div>
      </form>

      {analysis && <CoverletterAnalysisResults analysis={analysis} />}
    </div>
  );
} 