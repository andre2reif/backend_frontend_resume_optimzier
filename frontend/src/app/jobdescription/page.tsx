'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { jobdescriptionApi } from '@/lib/api';
import { jobdescription, ApiResponse } from '@/types/api';
import toast from 'react-hot-toast';
import FileUpload from '@/components/FileUpload';
import LayoutMain from '@/components/layout/LayoutMain';
import CreatejobdescriptionModal from '@/components/jobdescription/CreatejobdescriptionModal';

export default function jobdescriptionListPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [jobdescriptions, setjobdescriptions] = useState<jobdescription[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchjobdescriptions = useCallback(async () => {
    try {
      const response: ApiResponse<jobdescription[]> = await jobdescriptionApi.getAll();
      if (response.status === 'success') {
        setjobdescriptions(response.data);
      } else {
        console.error('Unerwartetes Datenformat:', response);
        setjobdescriptions([]);
      }
    } catch (error: any) {
      console.error('Fehler beim Laden der Stellenausschreibungen:', error);
      toast.error('Fehler beim Laden der Stellenausschreibungen');
      setjobdescriptions([]);
    }
  }, []);

  useEffect(() => {
    if (!session?.user?.email) {
      router.push('/auth/signin');
      return;
    }

    const loadInitialData = async () => {
      setIsLoading(true);
      await fetchjobdescriptions();
      setIsLoading(false);
    };

    loadInitialData();
  }, [session?.user?.email, router, fetchjobdescriptions]);

  const checkForDuplicates = (content: string): boolean => {
    return jobdescriptions.some(job => {
      // Normalisiere die Texte für den Vergleich
      const normalizedContent = content.toLowerCase().replace(/\s+/g, ' ').trim();
      const normalizedJobContent = job.content.toLowerCase().replace(/\s+/g, ' ').trim();
      
      // Berechne die Ähnlichkeit (einfacher Vergleich)
      const similarity = normalizedContent === normalizedJobContent;
      
      return similarity;
    });
  };

  const handleFileUpload = async (content: string, filename: string) => {
    if (!session?.user?.email) {
      toast.error('Bitte melden Sie sich an');
      return;
    }

    if (checkForDuplicates(content)) {
      toast.error('Diese Stellenausschreibung existiert bereits');
      return;
    }

    try {
      setIsUploading(true);
      const title = filename.replace(/\.[^/.]+$/, '');
      const response: ApiResponse<jobdescription> = await jobdescriptionApi.create({
        title,
        content,
      });
      
      if (response.status === 'success') {
        await fetchjobdescriptions();
        toast.success('Stellenausschreibung erfolgreich erstellt');
      } else {
        throw new Error('Keine Daten vom Server erhalten');
      }
    } catch (error: any) {
      console.error('Fehler beim Erstellen:', error);
      toast.error(error.message || 'Fehler beim Erstellen der Stellenausschreibung');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Möchten Sie diese Stellenausschreibung wirklich löschen?')) {
      return;
    }

    try {
      await jobdescriptionApi.delete(id);
      await fetchjobdescriptions();
      toast.success('Stellenausschreibung erfolgreich gelöscht');
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

  return (
    <LayoutMain>
      <div className="space-y-6">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-base-content">Meine Stellenausschreibungen</h1>
            <p className="mt-2 text-sm text-base-content/80">
              Verwalten Sie Ihre Stellenausschreibungen und analysieren Sie sie für optimale Bewerbungen.
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="btn btn-primary"
            >
              Neue Stellenausschreibung
            </button>
          </div>
        </div>

        <div className="overflow-hidden bg-base-200 shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-base-content">
              Neue Stellenausschreibung hochladen
            </h3>
            <div className="mt-2 max-w-xl text-sm text-base-content/80">
              <p>Laden Sie eine bestehende Stellenausschreibung hoch oder erstellen Sie eine neue.</p>
            </div>
            <div className="mt-5">
              <FileUpload onUpload={handleFileUpload} disabled={isUploading} />
            </div>
          </div>
        </div>

        <div className="overflow-hidden bg-base-200 shadow sm:rounded-lg">
          <ul className="divide-y divide-base-content/10">
            {jobdescriptions.map((jobdescription) => (
              <li key={jobdescription.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-base-content">{jobdescription.title}</h3>
                    <p className="mt-1 text-sm text-base-content/80">
                      Erstellt am {new Date(jobdescription.createdAt).toLocaleDateString('de-DE')}
                    </p>
                    {jobdescription.preview && (
                      <p className="mt-1 text-sm text-base-content/60 line-clamp-2">
                        {jobdescription.preview}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-base-content/40">
                      Status: {jobdescription.status}
                    </p>
                  </div>
                  <div className="ml-4 flex flex-shrink-0 space-x-2">
                    <Link
                      href={`/jobdescription/${jobdescription.id}`}
                      className="btn btn-sm btn-primary"
                    >
                      Bearbeiten
                    </Link>
                    <Link
                      href={`/jobdescription/${jobdescription.id}/analyze`}
                      className="btn btn-sm btn-secondary"
                    >
                      Analysieren
                    </Link>
                    <button
                      onClick={() => handleDelete(jobdescription.id)}
                      className="btn btn-sm btn-error"
                    >
                      Löschen
                    </button>
                  </div>
                </div>
              </li>
            ))}
            {jobdescriptions.length === 0 && (
              <li className="px-4 py-4 sm:px-6">
                <p className="text-sm text-base-content/80">
                  Sie haben noch keine Stellenausschreibungen erstellt.
                </p>
              </li>
            )}
          </ul>
        </div>
      </div>

      <CreatejobdescriptionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchjobdescriptions}
      />
    </LayoutMain>
  );
} 