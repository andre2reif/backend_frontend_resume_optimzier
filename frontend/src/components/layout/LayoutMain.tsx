'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { Toaster } from 'react-hot-toast';

const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Lebenslauf', href: '/resume' },
  { name: 'Anschreiben', href: '/coverletter' },
  { name: 'Credits', href: '/credits' },
];

export default function LayoutMain({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-base-100">
      <header className="bg-base-200">
        <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
          <div className="flex lg:flex-1">
            <Link href="/" className="-m-1.5 p-1.5">
              <span className="text-xl font-bold text-primary">CV Optimizer</span>
            </Link>
          </div>
          <div className="flex lg:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-base-content"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Menü öffnen</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="hidden lg:flex lg:gap-x-12">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-semibold leading-6 ${
                  pathname === item.href ? 'text-primary' : 'text-base-content hover:text-primary'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </nav>
        {/* Mobile menu */}
        <div className={`lg:hidden ${mobileMenuOpen ? 'fixed inset-0 z-50' : 'hidden'}`}>
          <div className="fixed inset-0 bg-base-300/80" aria-hidden="true" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-base-200 px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-base-content/10">
            <div className="flex items-center justify-between">
              <Link href="/" className="-m-1.5 p-1.5">
                <span className="text-xl font-bold text-primary">CV Optimizer</span>
              </Link>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-base-content"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Menü schließen</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-base-content/10">
                <div className="space-y-2 py-6">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 ${
                        pathname === item.href ? 'text-primary' : 'text-base-content hover:text-primary'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        {children}
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

      <Toaster position="bottom-right" />
    </div>
  );
} 