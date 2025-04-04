'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import Link from 'next/link';
import { resumeApi } from '@/lib/api/resume';
import { documentApi } from '@/lib/api/document';
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
  const [isUploadSectionVisible, setIsUploadSectionVisible] = useState(false);

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
          console.log('Gefundene unstrukturierte Dokumente:', unstructuredDocs);
          setIsStructuring(true);
          
          // Starte Strukturierung im Hintergrund
          structureMultipleDocuments(
            unstructuredDocs.map(doc => ({
              id: doc.id,
              type: 'resume',
              status: doc.status
            })),
            session.user.email
          ).then(async () => {
            console.log('Strukturierungsprozess abgeschlossen, lade Daten neu');
            // Lade die Daten nach der Strukturierung neu
            const updatedResponse = await resumeApi.getAll();
            if (updatedResponse.status === 'success' && updatedResponse.data) {
              const updatedSortedResumes = updatedResponse.data.sort((a, b) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );
              setResumes(updatedSortedResumes);
              setIsStructuring(false);
              toast.success('Lebensläufe wurden erfolgreich strukturiert');
            }
          }).catch(err => {
            console.error('Fehler bei der Strukturierung:', err);
            toast.error('Fehler bei der Strukturierung einiger Lebensläufe');
            setIsStructuring(false);
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
        setIsUploadSectionVisible(false);
        
        // Starte Strukturierung für das neue Dokument
        if (response.data.status === 'unstructured') {
          console.log('Starte Strukturierung für neues Dokument:', response.data);
          setIsStructuring(true);
          
          structureMultipleDocuments(
            [{
              id: response.data.id,
              type: 'resume',
              status: response.data.status
            }],
            session.user.email
          ).then(async () => {
            console.log('Strukturierung für neues Dokument abgeschlossen');
            // Lade die Daten nach der Strukturierung neu
            const updatedResponse = await resumeApi.getAll();
            if (updatedResponse.status === 'success' && updatedResponse.data) {
              const updatedSortedResumes = updatedResponse.data.sort((a, b) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );
              setResumes(updatedSortedResumes);
              setIsStructuring(false);
              toast.success('Lebenslauf wurde erfolgreich strukturiert');
            }
          }).catch(err => {
            console.error('Fehler bei der Strukturierung des neuen Dokuments:', err);
            toast.error('Fehler bei der Strukturierung des Lebenslaufs');
            setIsStructuring(false);
          });
        }
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
    console.log('ResumePage: handleDelete called for ID:', id);
    console.log('ResumePage: Current session:', session?.user?.email);
    console.log('ResumePage: Current resumes:', resumes);

    if (!session?.user?.email) {
      console.log('ResumePage: No user session found');
      toast.error('Bitte melden Sie sich an');
      return;
    }

    try {
      // Prüfe, ob der Lebenslauf noch in der Liste existiert
      const resumeExists = resumes.some(resume => resume._id === id || resume.id === id);
      console.log('ResumePage: Resume exists check:', resumeExists);
      console.log('ResumePage: Looking for resume with ID:', id);
      console.log('ResumePage: Available resume IDs:', resumes.map(r => ({ id: r.id, _id: r._id })));

      if (!resumeExists) {
        console.log('ResumePage: Resume already deleted or not found');
        return;
      }

      console.log('ResumePage: About to call documentApi.delete with params:', {
        id,
        email: session.user.email,
        type: 'resume'
      });

      const deleteResponse = await documentApi.delete(id, session.user.email, 'resume');
      console.log('ResumePage: Delete API response:', deleteResponse);

      // Aktualisiere die Liste und das deletingResumes Set
      console.log('ResumePage: Updating resumes list');
      setResumes(prevResumes => {
        const newResumes = prevResumes.filter(resume => resume._id !== id && resume.id !== id);
        console.log('ResumePage: New resumes list:', newResumes);
        // Wenn die Liste leer ist, leere auch das deletingResumes Set
        if (newResumes.length === 0) {
          console.log('ResumePage: No resumes left, clearing deletingResumes set');
          setDeletingResumes(new Set());
        }
        return newResumes;
      });
    } catch (error: any) {
      console.error('ResumePage: Error during delete:', error);
      console.error('ResumePage: Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });

      // Wenn der Fehler ein 404 ist, ignorieren wir ihn, da der Lebenslauf bereits gelöscht wurde
      if (error.message?.includes('404') || error.message?.includes('not found')) {
        console.log('ResumePage: Resume already deleted (404)');
        setResumes(prevResumes => {
          const newResumes = prevResumes.filter(resume => resume._id !== id && resume.id !== id);
          console.log('ResumePage: Updating resumes list after 404:', newResumes);
          // Wenn die Liste leer ist, leere auch das deletingResumes Set
          if (newResumes.length === 0) {
            console.log('ResumePage: No resumes left after 404, clearing deletingResumes set');
            setDeletingResumes(new Set());
          }
          return newResumes;
        });
        return;
      }
      
      console.error('ResumePage: Error deleting resume:', error);
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

  if (status === 'loading') {
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
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-base-content">Meine Lebensläufe</h1>
            <p className="mt-2 text-sm text-base-content/80">
              Verwalten Sie Ihre Lebensläufe und optimieren Sie sie für Ihre Bewerbungen.
            </p>
            {isStructuring && (
              <div className="mt-2 flex items-center gap-2 text-sm text-warning">
                <div className="loading loading-spinner loading-sm"></div>
                <span>Lebensläufe werden strukturiert... Dies kann einige Minuten dauern.</span>
              </div>
            )}
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 flex gap-2">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="btn btn-primary"
              disabled={isLoading}
            >
              Neuer Lebenslauf
            </button>
            <button
              onClick={() => setIsUploadSectionVisible(true)}
              className="btn btn-secondary"
              disabled={isLoading}
            >
              Lebenslauf hochladen
            </button>
          </div>
        </div>

        {/* Upload Modal */}
        <dialog id="upload_modal" className={`modal ${isUploadSectionVisible ? 'modal-open' : ''}`} onClick={(e) => {
          if (e.target === e.currentTarget) {
            setIsUploadSectionVisible(false);
          }
        }}>
          <div className="modal-box">
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
          
        </dialog>

        {isLoading && resumes.length === 0 ? (
          <div className="flex justify-center py-8">
            <div className="loading loading-spinner loading-lg"></div>
          </div>
        ) : (
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
        )}
      

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