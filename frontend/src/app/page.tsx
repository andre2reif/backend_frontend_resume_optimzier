'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRightIcon, DocumentTextIcon, EnvelopeIcon, SparklesIcon } from '@heroicons/react/24/outline';
import LayoutPublic from '@/components/layout/LayoutPublic';

const features = [
  {
    name: 'Lebenslauf-Optimierung',
    description: 'Optimieren Sie Ihren Lebenslauf für ATS-Systeme und erhöhen Sie Ihre Chancen auf ein Vorstellungsgespräch.',
    icon: DocumentTextIcon,
  },
  {
    name: 'Anschreiben-Generator',
    description: 'Erstellen Sie maßgeschneiderte Anschreiben mit KI-Unterstützung für jede Stellenausschreibung.',
    icon: EnvelopeIcon,
  },
  {
    name: 'KI-gestützte Analyse',
    description: 'Erhalten Sie detaillierte Einblicke in die Optimierungspotenziale Ihrer Bewerbungsunterlagen.',
    icon: SparklesIcon,
  },
];

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push('/dashboard');
    }
  }, [session, router]);

  return (
    <LayoutPublic>
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-base-content sm:text-6xl">
            CV Optimizer
          </h1>
          <p className="mt-6 text-lg leading-8 text-base-content/80">
            Optimieren Sie Ihren Lebenslauf für ATS-Systeme und erhöhen Sie Ihre Chancen auf ein
            Vorstellungsgespräch.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/auth/register"
              className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Jetzt starten
            </Link>
            <Link
              href="/auth/signin"
              className="text-sm font-semibold leading-6 text-base-content"
            >
              Anmelden <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </LayoutPublic>
  );
} 