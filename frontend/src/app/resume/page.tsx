'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { resumeApi } from '@/lib/api/resume';
import { Resume, ApiResponse } from '@/types/api';
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
  const [processingResumes, setProcessingResumes] = useState<Set<string>>(new Set());

  const fetchResumes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response: ApiResponse<Resume[]> = await resumeApi.getAll();
      
      if (response.status === 'success' && response.data) {
        // Sortiere Resumes nach Erstellungsdatum (neueste zuerst)
        const sortedResumes = response.data.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setResumes(sortedResumes);
        
        // Prüfe auf unstrukturierte Dokumente
        const unstructuredDocs = sortedResumes.filter(doc => doc.status === 'unstructured');
        if (unstructuredDocs.length > 0 && session?.user?.email) {
          // Starte Strukturierung im Hintergrund
          structureMultipleDocuments(
            unstructuredDocs.map(doc => ({
              id: doc.id,
              type: 'resume',
              status: doc.status
            })),
            session.user.email
          ).then(async () => {
            // Lade die Daten nach der Strukturierung neu
            const updatedResponse = await resumeApi.getAll();
            if (updatedResponse.status === 'success') {
              const updatedSortedResumes = updatedResponse.data.sort((a, b) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );
              setResumes(updatedSortedResumes);
            }
          }).catch(err => {
            console.error('Fehler bei der Strukturierung:', err);
            toast.error('Fehler bei der Strukturierung einiger Lebensläufe');
          });
        }
      } else {
        throw new Error('Keine Daten vom Server erhalten');
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
      
      // Erstelle temporäre Card für sofortiges Feedback
      const tempResume: Resume = {
        id: `temp-${Date.now()}`,
        title,
        content,
        status: 'processing',
        createdAt: new Date().toISOString(),
        userId: session.user.email
      };
      
      // Füge temporäre Card am Anfang der Liste hinzu
      setResumes(prevResumes => [tempResume, ...prevResumes]);
      setProcessingResumes(prev => new Set(prev).add(tempResume.id));

      const response = await resumeApi.create({
        title,
        content,
      });
      
      if (response.status === "success" && response.data) {
        // Ersetze temporäre Card durch echte Daten
        setResumes(prevResumes => 
          prevResumes.map(resume => 
            resume.id === tempResume.id ? response.data : resume
          )
        );
        setProcessingResumes(prev => {
          const newSet = new Set(prev);
          newSet.delete(tempResume.id);
          return newSet;
        });
        toast.success('Lebenslauf erfolgreich erstellt');
      } else {
        throw new Error('Fehler beim Erstellen');
      }
    } catch (error: any) {
      console.error('Fehler beim Erstellen:', error);
      toast.error(error.message || 'Fehler beim Erstellen des Lebenslaufs');
      // Entferne temporäre Card bei Fehler
      setResumes(prevResumes => prevResumes.filter(resume => resume.id !== `temp-${Date.now()}`));
      setProcessingResumes(prev => {
        const newSet = new Set(prev);
        newSet.delete(`temp-${Date.now()}`);
        return newSet;
      });
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
      // Verwende _id statt id für MongoDB
      const resumeId = updatedResume._id || updatedResume.id;
      if (!resumeId) {
        throw new Error('Keine gültige ID für den Lebenslauf gefunden');
      }

      // Finde den ursprünglichen Lebenslauf
      const originalResume = resumes.find(resume => 
        resume._id === resumeId || resume.id === resumeId
      );

      if (!originalResume) {
        throw new Error('Ursprünglicher Lebenslauf nicht gefunden');
      }

      console.log('Patching resume with ID:', resumeId); // Debug log
      const response: ApiResponse<Resume> = await resumeApi.patch(resumeId, originalResume, updatedResume);
      
      if (response.status === 'success' && response.data) {
        const updatedResume = response.data;
        setResumes(prevResumes => prevResumes.map(resume => 
          (resume._id === updatedResume._id || resume.id === updatedResume.id) ? updatedResume : resume
        ));
        toast.success('Erfolgreich geupdatet');
      } else {
        throw new Error('Fehler beim Speichern');
      }
    } catch (err) {
      console.error('Speichern Fehler:', err);
      toast.error('Es ist ein Fehler aufgetreten');
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
                  <div className="space-y-2">
                    {resume.status === 'unstructured' ? (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-warning">Wird strukturiert...</span>
                          <div className="loading loading-spinner loading-sm"></div>
                        </div>
                        <progress className="progress progress-warning w-full"></progress>
                      </div>
                    ) : resume.status === 'structured_complete' ? (
                      <p className="text-sm text-success flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Strukturiert
                      </p>
                    ) : (
                      <p className="text-sm text-error flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Fehler bei der Strukturierung
                      </p>
                    )}
                  </div>
                  <div className="card-actions justify-end">
                    {resume.id && processingResumes.has(resume.id) ? (
                      <div className="flex items-center space-x-2">
                        <div className="loading loading-spinner loading-sm"></div>
                        <span className="text-sm text-gray-500">Wird verarbeitet...</span>
                      </div>
                    ) : (
                      <button
                        className="btn btn-primary"
                        disabled={resume.status === 'unstructured'}
                        onClick={() => {
                          const resumeId = resume._id || resume.id;
                          if (resumeId) {
                            handleEdit(resumeId);
                          }
                        }}
                      >
                        {resume.status === 'unstructured' ? 'Wird vorbereitet...' : 'Bearbeiten'}
                      </button>
                    )}
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