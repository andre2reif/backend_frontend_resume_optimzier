'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { resumeApi } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function NewResumePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await resumeApi.create(formData);
      toast.success('Lebenslauf erfolgreich erstellt');
      router.push('/resume');
    } catch (error) {
      toast.error('Fehler beim Erstellen des Lebenslaufs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-base-content">Neuer Lebenslauf</h1>
          <p className="mt-2 text-sm text-base-content/80">
            Erstellen Sie einen neuen Lebenslauf, den Sie später optimieren können.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-base-content">
            Titel
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="title"
              id="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="block w-full rounded-md border-base-content/20 bg-base-100 px-3 py-2 text-base-content shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
              placeholder="z.B. Lebenslauf 2024"
            />
          </div>
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-base-content">
            Inhalt
          </label>
          <div className="mt-1">
            <textarea
              name="content"
              id="content"
              rows={20}
              required
              value={formData.content}
              onChange={handleChange}
              className="block w-full rounded-md border-base-content/20 bg-base-100 px-3 py-2 text-base-content shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
              placeholder="Fügen Sie hier Ihren Lebenslauf ein..."
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
            disabled={isLoading}
            className="inline-flex justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="loading loading-spinner loading-sm mr-2"></div>
                Wird erstellt...
              </>
            ) : (
              'Lebenslauf erstellen'
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 