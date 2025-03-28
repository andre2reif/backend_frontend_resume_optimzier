'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { resumeApi } from '@/lib/api';
import { Resume } from '@/types/api';
import toast from 'react-hot-toast';
import PDFDownloadButton from '@/components/PDFDownloadButton';

export default function ResumeEditPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [resume, setResume] = useState<Resume | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    fetchResume();
  }, [session, router, params.id]);

  const fetchResume = async () => {
    try {
      const response = await resumeApi.getById(params.id);
      setResume(response.data.data);
      setFormData({
        title: response.data.data.title,
        content: response.data.data.content,
      });
    } catch (error) {
      toast.error('Fehler beim Laden des Lebenslaufs');
      router.push('/resume');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await resumeApi.update(params.id, formData);
      setResume(response.data.data);
      toast.success('Lebenslauf erfolgreich gespeichert');
    } catch (error) {
      toast.error('Fehler beim Speichern des Lebenslaufs');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Möchten Sie diesen Lebenslauf wirklich löschen?')) {
      return;
    }

    try {
      await resumeApi.delete(params.id);
      toast.success('Lebenslauf erfolgreich gelöscht');
      router.push('/resume');
    } catch (error) {
      toast.error('Fehler beim Löschen des Lebenslaufs');
    }
  };

  if (!session) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (!resume) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-base-content">Lebenslauf bearbeiten</h1>
          <p className="mt-2 text-sm text-base-content/80">
            Bearbeiten Sie Ihren Lebenslauf und optimieren Sie ihn für ATS-Systeme.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0">
          <PDFDownloadButton
            resume={resume}
            className="btn btn-primary"
          />
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
  );
} 