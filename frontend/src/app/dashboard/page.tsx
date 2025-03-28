'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { DocumentTextIcon, EnvelopeIcon, CreditCardIcon } from '@heroicons/react/24/outline';

const stats = [
  { name: 'Lebensläufe', value: '0', href: '/resume' },
  { name: 'Anschreiben', value: '0', href: '/coverletter' },
  { name: 'Verbleibende Credits', value: '0', href: '/credits' },
];

export default function Dashboard() {
  const { data: session } = useSession();

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

  return (
    <div>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-base-content">Dashboard</h1>
            <p className="mt-2 text-sm text-base-content/80">
              Willkommen zurück, {session.user?.name}! Hier finden Sie eine Übersicht Ihrer Bewerbungsunterlagen.
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <Link
              href="/resume/new"
              className="block rounded-md bg-primary px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-primary/90"
            >
              Neuer Lebenslauf
            </Link>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <Link
              key={stat.name}
              href={stat.href}
              className="relative overflow-hidden rounded-lg bg-base-200 px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6"
            >
              <dt>
                <div className="absolute rounded-md bg-primary p-3">
                  {stat.name === 'Lebensläufe' && <DocumentTextIcon className="h-6 w-6 text-white" />}
                  {stat.name === 'Anschreiben' && <EnvelopeIcon className="h-6 w-6 text-white" />}
                  {stat.name === 'Verbleibende Credits' && <CreditCardIcon className="h-6 w-6 text-white" />}
                </div>
                <p className="ml-16 truncate text-sm font-medium text-base-content/80">{stat.name}</p>
              </dt>
              <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
                <p className="text-2xl font-semibold text-base-content">{stat.value}</p>
              </dd>
            </Link>
          ))}
        </div>

        <div className="mt-8">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h2 className="text-base font-semibold leading-6 text-base-content">Letzte Aktivitäten</h2>
              <p className="mt-2 text-sm text-base-content/80">
                Eine Übersicht Ihrer kürzlich erstellten oder bearbeiteten Dokumente.
              </p>
            </div>
          </div>
          <div className="mt-4 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-base-content/5 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-base-content/5">
                    <thead className="bg-base-200">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-base-content sm:pl-6">
                          Name
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-base-content">
                          Typ
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-base-content">
                          Letzte Änderung
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-base-content/5 bg-base-100">
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-base-content sm:pl-6">
                          Keine Dokumente vorhanden
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-base-content/80">-</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-base-content/80">-</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 