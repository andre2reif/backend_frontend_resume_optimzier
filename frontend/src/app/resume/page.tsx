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
import CardResume from '@/components/CardResume';

export default function ResumeListPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isStructuring, setIsStructuring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [processingResumes, setProcessingResumes] = useState<Set<string>>(new Set());
  const [deletingResumes, setDeletingResumes] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);

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
            if (updatedResponse.status === 'success' && updatedResponse.data) {
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
        updatedAt: new Date().toISOString(),
        userId: session.user.email
      };
      
      // Füge temporäre Card am Anfang der Liste hinzu
      setResumes(prevResumes => [tempResume, ...prevResumes]);
      setProcessingResumes(prev => {
        const newSet = new Set(prev);
        if (tempResume.id) {
          newSet.add(tempResume.id);
        }
        return newSet;
      });

      const response = await resumeApi.create({
        title,
        content,
      });
      
      if (response.status === "success" && response.data) {
        // Ersetze temporäre Card durch echte Daten
        setResumes(prevResumes => 
          prevResumes.map(resume => 
            resume.id === tempResume.id && response.data ? response.data : resume
          ).filter((resume): resume is Resume => resume !== undefined)
        );
        setProcessingResumes(prev => {
          const newSet = new Set(prev);
          if (tempResume.id) {
            newSet.delete(tempResume.id);
          }
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
    try {
      // Prüfe, ob der Lebenslauf noch in der Liste existiert
      const resumeExists = resumes.some(resume => resume._id === id || resume.id === id);
      if (!resumeExists) {
        console.log('Lebenslauf wurde bereits gelöscht');
        return;
      }

      await resumeApi.delete(id);
      
      // Aktualisiere die Liste und das deletingResumes Set
      setResumes(prevResumes => {
        const newResumes = prevResumes.filter(resume => resume._id !== id && resume.id !== id);
        // Wenn die Liste leer ist, leere auch das deletingResumes Set
        if (newResumes.length === 0) {
          setDeletingResumes(new Set());
        }
        return newResumes;
      });
    } catch (error: any) {
      // Wenn der Fehler ein 404 ist, ignorieren wir ihn, da der Lebenslauf bereits gelöscht wurde
      if (error.message?.includes('404') || error.message?.includes('not found')) {
        console.log('Lebenslauf wurde bereits gelöscht');
        setResumes(prevResumes => {
          const newResumes = prevResumes.filter(resume => resume._id !== id && resume.id !== id);
          // Wenn die Liste leer ist, leere auch das deletingResumes Set
          if (newResumes.length === 0) {
            setDeletingResumes(new Set());
          }
          return newResumes;
        });
        return;
      }
      
      console.error('Fehler beim Löschen des Lebenslaufs:', error);
      toast.error('Fehler beim Löschen des Lebenslaufs');
    }
  };

  const handleStartDelete = (id: string) => {
    setDeletingResumes(prev => {
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });
  };

  const handleCancelDelete = (id: string) => {
    setDeletingResumes(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const handleEdit = (id: string) => {
    setSelectedResumeId(id);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedResumeId(null);
  };

  const handleResumeUpdate = (updatedResume: Resume) => {
    setResumes(resumes.map(resume => 
      resume._id === updatedResume._id || resume.id === updatedResume._id ? updatedResume : resume
    ));
    handleModalClose();
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
              <CardResume
                key={resume._id || resume.id}
                resume={resume}
                processingResumes={processingResumes}
                deletingResumes={deletingResumes}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onStartDelete={handleStartDelete}
                onCancelDelete={handleCancelDelete}
              />
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

      {isModalOpen && selectedResumeId && (
        <ModalEditResume
          isOpen={isModalOpen}
          onClose={handleModalClose}
          resumeId={selectedResumeId}
          onSave={handleResumeUpdate}
        />
      )}
    </LayoutMain>
  );
} 