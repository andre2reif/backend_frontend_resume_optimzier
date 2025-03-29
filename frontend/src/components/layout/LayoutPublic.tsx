'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useSession, signOut } from 'next-auth/react';

const navigation = [
  { name: 'Produkt', href: '/product' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Über uns', href: '/about' },
];

export default function LayoutPublic({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div className="flex min-h-screen flex-col bg-base-100">
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
          <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4">
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm font-semibold leading-6 text-base-content hover:text-primary"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-sm font-semibold leading-6 text-base-content hover:text-primary"
                >
                  Abmelden
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="text-sm font-semibold leading-6 text-base-content hover:text-primary"
                >
                  Anmelden
                </Link>
                <Link
                  href="/auth/register"
                  className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90"
                >
                  Registrieren
                </Link>
              </>
            )}
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
                  {session ? (
                    <>
                      <Link
                        href="/dashboard"
                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-base-content hover:text-primary"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          handleSignOut();
                          setMobileMenuOpen(false);
                        }}
                        className="-mx-3 block w-full rounded-lg px-3 py-2 text-base font-semibold leading-7 text-base-content hover:text-primary text-left"
                      >
                        Abmelden
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/auth/signin"
                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-base-content hover:text-primary"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Anmelden
                      </Link>
                      <Link
                        href="/auth/register"
                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-base-content hover:text-primary"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Registrieren
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
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