'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { resumeApi } from '@/lib/api';
import { Resume } from '@/types/api';
import toast from 'react-hot-toast';
import FileUpload from '@/components/FileUpload';
import LayoutMain from '@/components/layout/LayoutMain';
import CreateResumeModal from '@/components/resume/CreateResumeModal';
import { structureMultipleDocuments } from '@/lib/services/structureService';
import ModalEditResume from '@/components/resume/ModalEditResume';

export default function ResumeListPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isStructuring, setIsStructuring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingResumeId, setEditingResumeId] = useState<string | null>(null);

  const fetchResumes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await resumeApi.getAll();
      console.log('Resumes response:', response); // Debug log
      
      if (response.status === 'success' && response.data) {
        setResumes(response.data);
        
        // Prüfe auf unstrukturierte Dokumente
        const unstructuredDocs = response.data.filter(doc => doc.status === 'unstructured');
        if (unstructuredDocs.length > 0 && session?.user?.email) {
          setIsStructuring(true);
          await structureMultipleDocuments(
            unstructuredDocs.map(doc => ({
              id: doc.id,
              type: 'resume',
              status: doc.status
            })),
            session.user.email
          );
          // Lade die Daten nach der Strukturierung neu
          const updatedResponse = await resumeApi.getAll();
          if (updatedResponse.status === 'success') {
            setResumes(updatedResponse.data);
          }
          setIsStructuring(false);
        }
      } else {
        throw new Error('Fehler beim Laden der Lebensläufe');
      }
    } catch (err) {
      console.error('Fehler beim Laden:', err);
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
      toast.error('Fehler beim Laden der Lebensläufe');
      setResumes([]);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.email]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email) {
      fetchResumes();
    } else if (status === 'unauthenticated') {
      router.push('/signin');
    }
  }, [status, session, router, fetchResumes]);

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
        throw new Error('Fehler beim Erstellen');
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

  const handleEdit = (resumeId: string) => {
    console.log('Bearbeite Lebenslauf mit ID:', resumeId); // Debug log
    setEditingResumeId(resumeId);
  };

  const handleSave = async (updatedResume: Resume) => {
    try {
      const response = await resumeApi.update(updatedResume.id, updatedResume);
      if (response.status === 'success' && response.data) {
        setResumes(resumes.map(resume => 
          resume.id === response.data.id ? response.data : resume
        ));
        toast.success('Lebenslauf erfolgreich aktualisiert');
      } else {
        throw new Error('Fehler beim Speichern');
      }
    } catch (err) {
      console.error('Speichern Fehler:', err);
      toast.error('Fehler beim Speichern des Lebenslaufs');
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <LayoutMain>
        <div className="flex min-h-screen items-center justify-center">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </LayoutMain>
    );
  }

  if (error) {
    return (
      <LayoutMain>
        <div className="alert alert-error m-4">
          <span>{error}</span>
        </div>
      </LayoutMain>
    );
  }

  return (
    <LayoutMain>
      <div className="space-y-6">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-base-content">Meine Lebensläufe</h1>
            <p className="mt-2 text-sm text-base-content/80">
              Verwalten Sie Ihre Lebensläufe und optimieren Sie sie für Ihre Bewerbungen.
            </p>
            {isStructuring && (
              <p className="mt-2 text-sm text-warning">
                Lebensläufe werden strukturiert... Dies kann einige Minuten dauern.
              </p>
            )}
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="btn btn-primary"
            >
              Neuer Lebenslauf
            </button>
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

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {resumes.length > 0 ? (
            resumes.map((resume) => (
              <div key={resume.id} className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title">{resume.title}</h2>
                  <p className="text-sm text-gray-500">
                    Erstellt am {new Date(resume.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Status: {resume.status || 'unstructured'}
                  </p>
                  {/* Debug-Info */}
                  <p className="text-xs text-gray-400">ID: {resume.id}</p>
                  <div className="card-actions justify-end">
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        console.log('Clicked resume:', resume); // Debug log
                        if (resume.id) {
                          handleEdit(resume.id);
                        } else {
                          console.error('Keine ID für Resume:', resume);
                        }
                      }}
                    >
                      Bearbeiten
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div key="empty" className="col-span-full text-center">
              <p>Keine Lebensläufe vorhanden</p>
            </div>
          )}
        </div>
      </div>

      <CreateResumeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchResumes}
      />

      <ModalEditResume
        isOpen={!!editingResumeId}
        onClose={() => setEditingResumeId(null)}
        resumeId={editingResumeId || ''}
        onSave={handleSave}
      />
    </LayoutMain>
  );
} 