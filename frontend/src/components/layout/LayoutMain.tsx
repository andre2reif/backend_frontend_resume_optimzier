'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { signOut } from 'next-auth/react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Lebenslauf', href: '/resume' },
  { name: 'Anschreiben', href: '/coverletter' },
  { name: 'Stellenausschreibung', href: '/jobdescription' },
  { name: 'Credits', href: '/credits' },
];

export default function LayoutMain({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div className="flex min-h-screen flex-col bg-base-100">
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-6 py-32 lg:px-8">
          {children}
        </div>
      </main>

      <footer className="bg-base-200">
        <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <Link href="/impressum" className="text-base-content hover:text-primary">
              Impressum
            </Link>
            <Link href="/datenschutz" className="text-base-content hover:text-primary">
              Datenschutz
            </Link>
          </div>
          <div className="mt-8 md:order-1 md:mt-0">
            <p className="text-center text-xs leading-5 text-base-content">
              &copy; {new Date().getFullYear()} CV Optimizer. Alle Rechte vorbehalten.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
} 