'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { coverletterApi } from '@/lib/api/coverletter';
import { documentApi } from '@/lib/api/document';
import { CoverLetter, ApiResponse } from '@/types/api';
import toast from 'react-hot-toast';
import FileUpload from '@/components/upload/FileUpload';
import LayoutMain from '@/components/layout/LayoutMain';
import { CreateCoverletterModal } from '@/components/coverletter/CreateCoverletterModal';
import { structureMultipleDocuments } from '@/lib/services/structureService';
import { ModalEditCoverletter } from '@/components/coverletter/ModalEditCoverletter';
import CardCoverletter from '@/components/coverletter/CardCoverletter';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, listItem, fadeIn, fadeInUp } from '@/lib/animations/animation-variants';
import { ModalFileUpload } from '@/components/coverletter/ModalFileUpload';

export default function CoverletterListPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [coverletters, setCoverletters] = useState<CoverLetter[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isStructuring, setIsStructuring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCoverletterId, setSelectedCoverletterId] = useState<string | null>(null);
  const [processingCoverletters, setProcessingCoverletters] = useState<Set<string>>(new Set());
  const [deletingCoverletters, setDeletingCoverletters] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadSectionVisible, setIsUploadSectionVisible] = useState(false);

  const fetchCoverletters = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response: ApiResponse<CoverLetter[]> = await coverletterApi.getAll();
      
      if (response.status === 'success' && response.data) {
        console.log('API Response:', response);
        // Sortiere Coverletters nach Erstellungsdatum (neueste zuerst)
        const sortedCoverletters = response.data.sort((a: CoverLetter, b: CoverLetter) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        console.log('Sorted Coverletters:', sortedCoverletters);
        setCoverletters(sortedCoverletters);
        
        // Prüfe auf unstrukturierte Dokumente
        const unstructuredDocs = sortedCoverletters.filter(doc => doc.status === 'unstructured');
        console.log('Unstrukturierte Dokumente gefunden:', unstructuredDocs);
        
        if (unstructuredDocs.length > 0 && session?.user?.email) {
          setIsStructuring(true);
          console.log('Starte Strukturierung der Anschreiben:', unstructuredDocs);
          
          const documentsToStructure = unstructuredDocs.map(doc => {
            console.log('Verarbeite Dokument:', doc);
            console.log('Dokument ID:', doc.id);
            return {
              id: doc.id,
              type: 'coverletter' as const,
              status: doc.status
            };
          });
          console.log('Dokumente für die Strukturierung:', documentsToStructure);
          console.log('API-Aufruf an structureMultipleDocuments mit:', {
            documents: documentsToStructure,
            userId: session.user.email
          });

          structureMultipleDocuments(
            documentsToStructure,
            session.user.email
          ).then(async () => {
            console.log('Strukturierung erfolgreich abgeschlossen');
            // Lade die Daten nach der Strukturierung neu
            const updatedResponse = await coverletterApi.getAll();
            if (updatedResponse.status === 'success' && updatedResponse.data) {
              const updatedSortedCoverletters = updatedResponse.data.sort((a: CoverLetter, b: CoverLetter) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );
              setCoverletters(updatedSortedCoverletters);
              console.log('Liste nach Strukturierung aktualisiert:', updatedSortedCoverletters);
            }
          }).catch(err => {
            console.error('Fehler bei der Strukturierung:', err);
            toast.error('Fehler bei der Strukturierung einiger Anschreiben');
          }).finally(() => {
            setIsStructuring(false);
            console.log('Strukturierungsprozess beendet');
          });
        }
      } else {
        throw new Error('Keine Daten vom Server erhalten');
      }
    } catch (err) {
      console.error('Fehler beim Laden:', err);
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
      toast.error('Fehler beim Laden der Lebensläufe');
      setCoverletters([]);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.email]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email) {
      fetchCoverletters();
    } else if (status === 'unauthenticated') {
      router.push('/signin');
    }
  }, [status, session, router, fetchCoverletters]);

  const handleFileUpload = async (content: string, filename: string) => {
    if (!session?.user?.email) {
      toast.error('Bitte melden Sie sich an');
      return;
    }

    try {
      setIsUploading(true);
      const title = filename.replace(/\.[^/.]+$/, '');
      
      // Erstelle temporäre Card für sofortiges Feedback
      const tempCoverletter: CoverLetter = {
        id: `temp-${Date.now()}`,
        title,
        content,
        status: 'processing',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: session.user.email
      };
      
      // Füge temporäre Card am Anfang der Liste hinzu
      setCoverletters(prevCoverletters => [tempCoverletter, ...prevCoverletters]);
      setProcessingCoverletters(prev => {
        const newSet = new Set(prev);
        if (tempCoverletter.id) {
          newSet.add(tempCoverletter.id);
        }
        return newSet;
      });

      // Erstelle das Anschreiben
      console.log('Sende Anfrage zum Erstellen des Anschreibens:', {
        title,
        contentLength: content.length,
        language: 'de',
        userId: session.user.email
      });

      const response = await coverletterApi.create({
        title,
        rawText: content,
        language: 'de',
        userId: session.user.email
      });

      console.log('Server-Antwort:', response);

      if (!response || !response.data) {
        throw new Error('Keine gültige Antwort vom Server erhalten');
      }

      // Prüfe auf id oder _id
      const documentId = response.data.id || response.data._id;
      if (!documentId) {
        console.error('Antwort ohne ID:', response);
        throw new Error('Keine ID vom Server erhalten');
      }

      // Ersetze temporäre Card durch echte Daten
      setCoverletters(prevCoverletters => 
        prevCoverletters.map(coverletter => 
          coverletter.id === tempCoverletter.id && response.data ? response.data : coverletter
        ).filter((coverletter): coverletter is CoverLetter => coverletter !== undefined)
      );

      // Warte kurz, bis die Daten in der Datenbank verfügbar sind
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Strukturiere das Anschreiben
      try {
        console.log('Starte Strukturierung für Anschreiben:', documentId);
        const structureResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/extract-structured-document?document_id=${documentId}&document_type=coverletter&language=de&user_id=${session.user.email}`
        );

        if (!structureResponse.ok) {
          const errorText = await structureResponse.text();
          console.error('Strukturierungsfehler:', errorText);
          throw new Error(`Fehler bei der Strukturierung: ${errorText}`);
        }

        const structureResult = await structureResponse.json();
        console.log('Strukturierung erfolgreich:', structureResult);

        // Aktualisiere die Liste der Anschreiben
        const updatedResponse = await coverletterApi.getAll();
        if (updatedResponse.data) {
          setCoverletters(updatedResponse.data);
        }

        // Schließe das Upload-Modal
        setIsUploadSectionVisible(false);
        
        // Zeige Erfolgsmeldung
        toast.success('Anschreiben erfolgreich hochgeladen und strukturiert', {
          duration: 4000,
          position: 'bottom-left',
          style: {
            background: '#1a1a1a',
            color: '#fff',
          },
        });
      } catch (error) {
        console.error('Fehler bei der Strukturierung:', error);
        toast.error('Fehler bei der Strukturierung des Anschreibens', {
          duration: 4000,
          position: 'bottom-left',
          style: {
            background: '#1a1a1a',
            color: '#fff',
          },
        });
        // Lade die Liste trotzdem neu, um den aktuellen Status zu sehen
        const updatedResponse = await coverletterApi.getAll();
        if (updatedResponse.data) {
          setCoverletters(updatedResponse.data);
        }
      }
    } catch (error) {
      console.error('Fehler beim Erstellen:', error);
      toast.error('Fehler beim Erstellen des Anschreibens', {
        duration: 4000,
        position: 'bottom-left',
        style: {
          background: '#1a1a1a',
          color: '#fff',
        },
      });
      // Entferne temporäre Card bei Fehler
      setCoverletters(prevCoverletters => prevCoverletters.filter(coverletter => coverletter.id !== `temp-${Date.now()}`));
      setProcessingCoverletters(prev => {
        const newSet = new Set(prev);
        newSet.delete(`temp-${Date.now()}`);
        return newSet;
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    console.log('CoverletterPage: handleDelete called for ID:', id);
    console.log('CoverletterPage: Current session:', session?.user?.email);
    console.log('CoverletterPage: Current coverletters:', coverletters);

    if (!session?.user?.email) {
      console.log('CoverletterPage: No user session found');
      toast.error('Bitte melden Sie sich an');
      return;
    }

    try {
      // Prüfe, ob das Anschreiben noch in der Liste existiert
      const coverletterExists = coverletters.some(coverletter => coverletter._id === id || coverletter.id === id);
      console.log('CoverletterPage: Coverletter exists check:', coverletterExists);
      console.log('CoverletterPage: Looking for coverletter with ID:', id);
      console.log('CoverletterPage: Available coverletter IDs:', coverletters.map(c => ({ id: c.id, _id: c._id })));

      if (!coverletterExists) {
        console.log('CoverletterPage: Coverletter already deleted or not found');
        return;
      }

      console.log('CoverletterPage: About to call documentApi.delete with params:', {
        id,
        email: session.user.email,
        type: 'coverletter'
      });

      const deleteResponse = await documentApi.delete(id, session.user.email, 'coverletter');
      console.log('CoverletterPage: Delete API response:', deleteResponse);

      // Aktualisiere die Liste und das deletingCoverletters Set
      console.log('CoverletterPage: Updating coverletters list');
      setCoverletters(prevCoverletters => {
        const newCoverletters = prevCoverletters.filter(coverletter => coverletter._id !== id && coverletter.id !== id);
        console.log('CoverletterPage: New coverletters list:', newCoverletters);
        // Wenn die Liste leer ist, leere auch das deletingCoverletters Set
        if (newCoverletters.length === 0) {
          console.log('CoverletterPage: No coverletters left, clearing deletingCoverletters set');
          setDeletingCoverletters(new Set());
        }
        return newCoverletters;
      });
    } catch (error: any) {
      console.error('CoverletterPage: Error during delete:', error);
      console.error('CoverletterPage: Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });

      // Wenn der Fehler ein 404 ist, ignorieren wir ihn, da das Anschreiben bereits gelöscht wurde
      if (error.message?.includes('404') || error.message?.includes('not found')) {
        console.log('CoverletterPage: Coverletter already deleted (404)');
        setCoverletters(prevCoverletters => {
          const newCoverletters = prevCoverletters.filter(coverletter => coverletter._id !== id && coverletter.id !== id);
          console.log('CoverletterPage: Updating coverletters list after 404:', newCoverletters);
          // Wenn die Liste leer ist, leere auch das deletingCoverletters Set
          if (newCoverletters.length === 0) {
            console.log('CoverletterPage: No coverletters left after 404, clearing deletingCoverletters set');
            setDeletingCoverletters(new Set());
          }
          return newCoverletters;
        });
        return;
      }
      
      console.error('CoverletterPage: Error deleting coverletter:', error);
      toast.error('Fehler beim Löschen des Anschreibens');
    }
  };

  const handleStartDelete = (id: string) => {
    setDeletingCoverletters(prev => {
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });
  };

  const handleCancelDelete = (id: string) => {
    setDeletingCoverletters(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const handleEdit = (id: string) => {
    setSelectedCoverletterId(id);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCoverletterId(null);
  };

  const handleCoverletterUpdate = (updatedCoverletter: CoverLetter) => {
    setCoverletters(coverletters.map(coverletter => 
      coverletter.id === updatedCoverletter.id ? updatedCoverletter : coverletter
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
    <div className="min-h-screen bg-gray-50">
      <LayoutMain>
          <motion.main 
            className="flex flex-col gap-8"
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
                Meine Anschreiben
              </motion.h1>
              
              <motion.div 
                className="flex gap-4"
                variants={fadeIn}
                transition={{ delay: 0.2 }}
              >
                <button
                  onClick={() => setIsUploadSectionVisible(!isUploadSectionVisible)}
                  className="btn btn-primary"
                >
                  {isUploadSectionVisible ? 'Abbrechen' : 'Anschreiben hochladen'}
                </button>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="btn btn-secondary"
                >
                  Anschreiben erstellen
                </button>
              </motion.div>
            </motion.div>

            <motion.h3 
              className="text-xl mb-8 text-slate-400"
              variants={fadeIn}
              transition={{ delay: 0.12 }}
            >
              Hier verwaltest du deine Anschreiben. Sie werden strukturiert und später mit deinem Lebenslauf auf deine künftige Stelle angepasst und optimiert.
            </motion.h3>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {coverletters.map((coverletter, index) => (
                <motion.div
                  key={coverletter.id || coverletter._id}
                  variants={fadeInUp}
                  transition={{ delay: index * 0.1 }}
                >
                  <CardCoverletter
                    coverletter={coverletter}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                    processingCoverletters={processingCoverletters}
                    deletingCoverletters={deletingCoverletters}
                    onStartDelete={handleStartDelete}
                    onCancelDelete={handleCancelDelete}
                  />
                </motion.div>
              ))}
            </motion.div>

            <AnimatePresence>
              {isUploadSectionVisible && (
                <ModalFileUpload
                  isOpen={isUploadSectionVisible}
                  onClose={() => setIsUploadSectionVisible(false)}
                  onUpload={handleFileUpload}
                  disabled={isUploading}
                />
              )}
            </AnimatePresence>
          </motion.main>
      </LayoutMain>

      {isCreateModalOpen && (
        <CreateCoverletterModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={fetchCoverletters}
        />
      )}

      {selectedCoverletterId && (
        <ModalEditCoverletter
          isOpen={isModalOpen}
          onClose={handleModalClose}
          coverletterId={selectedCoverletterId}
          onSave={handleCoverletterUpdate}
        />
      )}
    </div>
  );
} 