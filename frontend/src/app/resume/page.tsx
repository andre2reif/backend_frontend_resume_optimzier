'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

import Link from 'next/link';
import { resumeApi } from '@/lib/api/resume';
import { documentApi } from '@/lib/api/document';
import { Resume, ApiResponse } from '@/types/api';
import toast from 'react-hot-toast';
import FileUpload from '@/components/upload/FileUpload';
import LayoutMain from '@/components/layout/LayoutMain';
import CreateResumeModal from '@/components/resume/CreateResumeModal';
import { structureMultipleDocuments } from '@/lib/services/structureService';
import ModalEditResume from '@/components/resume/ModalEditResume';
import CardResume from '@/components/resume/CardResume';
import UploadResumeModal from '@/components/resume/UploadResumeModal';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" }
};

const fadeIn = {
  initial: { opacity: 0, y: 5 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: "easeOut" }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

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
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

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
        setIsUploadModalOpen(false);
        
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
        throw new Error('Keine Daten vom Server erhalten');
      }
    } catch (error: any) {
      console.error('Fehler beim Hochladen:', error);
      toast.error(error.message || 'Fehler beim Hochladen des Lebenslaufs');
      
      // Entferne temporäre Card bei Fehler
      setResumes(prevResumes => 
        prevResumes.filter(resume => resume.id !== `temp-${Date.now()}`)
      );
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
    <div className="min-h-screen bg-gray-50">
      <LayoutMain>
        <motion.main 
          className=""
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
         
            <motion.div 
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              variants={fadeInUp}
            >
              <motion.h1 
                className="text-3xl font-bold text-slate-700"
                variants={fadeIn}
              >
                Meine Lebensläufe
              </motion.h1>
              
              <motion.div 
                className="flex gap-4"
                variants={fadeIn}
                transition={{ delay: 0.2 }}
              >
                <button
                  onClick={() => setIsUploadModalOpen(!isUploadModalOpen)}
                  className="btn btn-primary"
                >
                  {isUploadModalOpen ? 'Abbrechen' : 'Lebenslauf hochladen'}
                </button>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="btn btn-secondary"
                >
                  Lebenslauf erstellen
                </button>
              </motion.div>
              
            </motion.div>
            <motion.h3 
          className="text-xl mb-8 text-slate-400 py-8"
          variants={fadeIn}
          transition={{ delay: 0.12 }}
        >
          Hier verwaltetest du deine Lebensläufe. Sie werden strukturiert. Und später mit deinem Anschreiben auf deine künfitge Stelle anzupassen und zu optimieren.
          </motion.h3>
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={staggerContainer}
            >
              {resumes.map((resume, index) => (
                <motion.div
                  key={resume.id || resume._id}
                  variants={fadeInUp}
                  transition={{ delay: index * 0.1 }}
                >
                  <CardResume
                    resume={resume}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                    processingResumes={processingResumes}
                    deletingResumes={deletingResumes}
                    onStartDelete={handleStartDelete}
                    onCancelDelete={handleCancelDelete}
                  />
                </motion.div>
              ))}
            </motion.div>

            {isUploadModalOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-8"
              >
                <FileUpload
                  onUpload={handleFileUpload}
                  disabled={isUploading}
                  accept=".pdf,.doc,.docx,.txt"
                />
              </motion.div>
            )}
          
        </motion.main>
      </LayoutMain>

      {isCreateModalOpen && (
        <CreateResumeModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={fetchResumes}
        />
      )}

      <UploadResumeModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleFileUpload}
        isUploading={isUploading}
      />

      {selectedResumeId && (
        <ModalEditResume
          isOpen={isModalOpen}
          onClose={handleModalClose}
          resumeId={selectedResumeId}
          onSave={handleResumeUpdate}
        />
      )}
    </div>
  );
} 