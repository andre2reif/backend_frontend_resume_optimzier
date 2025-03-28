'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="navbar bg-base-200">
      <div className="flex-1">
        <Link href="/" className="btn btn-ghost text-xl normal-case">
          CV Optimizer
        </Link>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal px-1">
          {session ? (
            <>
              <li>
                <Link
                  href="/resume"
                  className={isActive('/resume') ? 'active' : ''}
                >
                  Lebensläufe
                </Link>
              </li>
              <li>
                <button onClick={() => signOut({ callbackUrl: '/' })}>
                  Abmelden
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link
                  href="/auth/signin"
                  className={isActive('/auth/signin') ? 'active' : ''}
                >
                  Anmelden
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/register"
                  className={isActive('/auth/register') ? 'active' : ''}
                >
                  Registrieren
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
} 