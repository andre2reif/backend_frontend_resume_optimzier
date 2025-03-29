'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { jobDescriptionApi } from '@/lib/api';
import { JobDescription } from '@/types/api';
import toast from 'react-hot-toast';
import LayoutMain from '@/components/layout/LayoutMain';

export default function JobDescriptionEditPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [jobDescription, setJobDescription] = useState<JobDescription | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    fetchJobDescription();
  }, [session, router, params.id]);

  const fetchJobDescription = async () => {
    try {
      const response = await jobDescriptionApi.getById(params.id);
      if (response.data.data) {
        setJobDescription(response.data.data);
        setFormData({
          title: response.data.data.title,
          content: response.data.data.content,
        });
      } else {
        throw new Error('Keine Daten vom Server erhalten');
      }
    } catch (error) {
      toast.error('Fehler beim Laden der Stellenausschreibung');
      router.push('/jobdescription');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await jobDescriptionApi.update(params.id, formData);
      if (response.data.data) {
        setJobDescription(response.data.data);
        toast.success('Stellenausschreibung erfolgreich gespeichert');
      } else {
        throw new Error('Keine Daten vom Server erhalten');
      }
    } catch (error) {
      toast.error('Fehler beim Speichern der Stellenausschreibung');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Möchten Sie diese Stellenausschreibung wirklich löschen?')) {
      return;
    }

    try {
      await jobDescriptionApi.delete(params.id);
      toast.success('Stellenausschreibung erfolgreich gelöscht');
      router.push('/jobdescription');
    } catch (error) {
      toast.error('Fehler beim Löschen der Stellenausschreibung');
    }
  };

  if (!session) {
    return null;
  }

  if (isLoading) {
    return (
      <LayoutMain>
        <div className="flex min-h-screen items-center justify-center">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </LayoutMain>
    );
  }

  if (!jobDescription) {
    return null;
  }

  return (
    <LayoutMain>
      <div className="space-y-6">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-base-content">Stellenausschreibung bearbeiten</h1>
            <p className="mt-2 text-sm text-base-content/80">
              Bearbeiten Sie Ihre Stellenausschreibung und analysieren Sie sie für optimale Bewerbungen.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-base-content">
              Titel
            </label>
            <input
              type="text"
              name="title"
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 block w-full rounded-md border-base-content/20 bg-base-100 px-3 py-2 text-base-content shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-base-content">
              Inhalt
            </label>
            <textarea
              name="content"
              id="content"
              rows={20}
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="mt-1 block w-full rounded-md border-base-content/20 bg-base-100 px-3 py-2 text-base-content shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleDelete}
              className="btn btn-error"
            >
              Löschen
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="btn btn-primary"
            >
              {isSaving ? (
                <>
                  <div className="loading loading-spinner loading-sm mr-2"></div>
                  Wird gespeichert...
                </>
              ) : (
                'Speichern'
              )}
            </button>
          </div>
        </form>
      </div>
    </LayoutMain>
  );
} 