'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { resumeApi } from '@/lib/api';
import { Resume } from '@/types/api';
import toast from 'react-hot-toast';
import FileUpload from '@/components/FileUpload';

export default function ResumeListPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [resumes, setResumes] = useState<Resume[]>([]);

  // Memoisierte fetchResumes Funktion
  const fetchResumes = useCallback(async () => {
    try {
      const response = await resumeApi.getAll();
      console.log('Lebensläufe geladen:', response.status);
      
      if (response.status === "success" && Array.isArray(response.data)) {
        setResumes(response.data);
      } else {
        console.error('Unerwartetes Datenformat:', response);
        setResumes([]);
      }
    } catch (error: any) {
      console.error('Fehler beim Laden der Lebensläufe:', error);
      toast.error('Fehler beim Laden der Lebensläufe');
      setResumes([]);
    }
  }, []); // Keine Abhängigkeiten, da keine externen Variablen verwendet werden

  useEffect(() => {
    if (!session?.user?.email) {
      router.push('/auth/signin');
      return;
    }

    const loadInitialData = async () => {
      setIsLoading(true);
      await fetchResumes();
      setIsLoading(false);
    };

    loadInitialData();
  }, [session?.user?.email, router, fetchResumes]);

  const handleFileUpload = async (content: string, filename: string) => {
    if (!session?.user?.email) {
      toast.error('Bitte melden Sie sich an');
      return;
    }

    try {
      setIsUploading(true);
      const title = filename.replace(/\.[^/.]+$/, '');
      const response = await resumeApi.create({
        title,
        content,
      });
      
      if (response.status === "success" && response.data) {
        await fetchResumes();
        toast.success('Lebenslauf erfolgreich erstellt');
      } else {
        throw new Error('Keine Daten vom Server erhalten');
      }
    } catch (error: any) {
      console.error('Fehler beim Erstellen:', error);
      toast.error(error.message || 'Fehler beim Erstellen des Lebenslaufs');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Möchten Sie diesen Lebenslauf wirklich löschen?')) {
      return;
    }

    try {
      await resumeApi.delete(id);
      await fetchResumes();
      toast.success('Lebenslauf erfolgreich gelöscht');
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

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-base-content">Meine Lebensläufe</h1>
          <p className="mt-2 text-sm text-base-content/80">
            Verwalten Sie Ihre Lebensläufe und optimieren Sie sie für ATS-Systeme.
          </p>
        </div>
      </div>

      <div className="overflow-hidden bg-base-200 shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-base-content">
            Neuen Lebenslauf hochladen
          </h3>
          <div className="mt-2 max-w-xl text-sm text-base-content/80">
            <p>Laden Sie einen bestehenden Lebenslauf hoch oder erstellen Sie einen neuen.</p>
          </div>
          <div className="mt-5">
            <FileUpload onUpload={handleFileUpload} disabled={isUploading} />
          </div>
        </div>
      </div>

      <div className="overflow-hidden bg-base-200 shadow sm:rounded-lg">
        <ul className="divide-y divide-base-content/10">
          {resumes.map((resume) => (
            <li key={resume.id} className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-base-content">{resume.title}</h3>
                  <p className="mt-1 text-sm text-base-content/80">
                    Erstellt am {new Date(resume.createdAt).toLocaleDateString('de-DE')}
                  </p>
                  {resume.preview && (
                    <p className="mt-1 text-sm text-base-content/60 line-clamp-2">
                      {resume.preview}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-base-content/40">
                    Status: {resume.status}
                  </p>
                </div>
                <div className="ml-4 flex flex-shrink-0 space-x-2">
                  <Link
                    href={`/resume/${resume.id}`}
                    className="btn btn-sm btn-primary"
                  >
                    Bearbeiten
                  </Link>
                  <Link
                    href={`/resume/${resume.id}/analyze`}
                    className="btn btn-sm btn-secondary"
                  >
                    Analysieren
                  </Link>
                  <button
                    onClick={() => handleDelete(resume.id)}
                    className="btn btn-sm btn-error"
                  >
                    Löschen
                  </button>
                </div>
              </div>
            </li>
          ))}
          {resumes.length === 0 && (
            <li className="px-4 py-4 sm:px-6">
              <p className="text-sm text-base-content/80">
                Sie haben noch keine Lebensläufe erstellt.
              </p>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
} 