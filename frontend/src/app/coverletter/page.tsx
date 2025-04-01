'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { coverletterApi } from '@/lib/api/coverletter';
import { documentApi } from '@/lib/api/document';
import { CoverLetter, ApiResponse } from '@/types/api';
import toast from 'react-hot-toast';
import FileUpload from '@/components/FileUpload';
import LayoutMain from '@/components/layout/LayoutMain';
import { CreateCoverletterModal } from '@/components/coverletter/CreateCoverletterModal';
import { structureMultipleDocuments } from '@/lib/services/structureService';
import { ModalEditCoverletter } from '@/components/coverletter/ModalEditCoverletter';
import CardCoverletter from '@/components/coverletter/CardCoverletter';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, listItem } from '@/lib/animations/animation-variants';

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

      if (!response.data._id) {
        console.error('Antwort ohne ID:', response);
        throw new Error('Keine ID vom Server erhalten');
      }

      // Warte kurz, bis die Daten in der Datenbank verfügbar sind
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Strukturiere das Anschreiben
      try {
        console.log('Starte Strukturierung für Anschreiben:', response.data._id);
        const structureResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/extract-structured-document?document_id=${response.data._id}&document_type=coverletter&language=de&user_id=${session.user.email}`
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

        toast.success('Anschreiben erfolgreich erstellt und strukturiert');
      } catch (error) {
        console.error('Fehler bei der Strukturierung:', error);
        toast.error('Fehler bei der Strukturierung des Anschreibens');
        // Lade die Liste trotzdem neu, um den aktuellen Status zu sehen
        const updatedResponse = await coverletterApi.getAll();
        if (updatedResponse.data) {
          setCoverletters(updatedResponse.data);
        }
      }
    } catch (error) {
      console.error('Fehler beim Erstellen:', error);
      toast.error('Fehler beim Erstellen des Anschreibens');
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
              Anschreiben erstellen
            </button>
          </div>
        </div>

        <div className="overflow-hidden bg-base-200 shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-base-content">
              Neues Anschreiben erstellen
            </h3>
            <div className="mt-2 max-w-xl text-sm text-base-content/80">
              <p>Erstellen Sie ein neues Anschreiben oder laden Sie einen bestehenden Lebenslauf hoch.</p>
            </div>
            <div className="mt-5">
              <FileUpload onUpload={handleFileUpload} disabled={isUploading} />
            </div>
          </div>
        </div>

        <motion.div 
          className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <AnimatePresence>
            {coverletters.length > 0 ? (
              coverletters
                .filter(coverletter => {
                  const coverletterId = coverletter._id || coverletter.id;
                  return coverletterId && !deletingCoverletters.has(coverletterId);
                })
                .map((coverletter) => (
                  <motion.div 
                    key={`coverletter-${coverletter._id || coverletter.id}`}
                    variants={listItem}
                    layout
                  >
                    <CardCoverletter
                      coverletter={coverletter}
                      onDelete={handleDelete}
                    />
                  </motion.div>
                ))
            ) : (
              <motion.div 
                className="col-span-full text-center"
                variants={listItem}
              >
                <p>Keine Lebensläufe vorhanden</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <CreateCoverletterModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchCoverletters}
      />

      {isModalOpen && selectedCoverletterId && (
        <ModalEditCoverletter
          isOpen={isModalOpen}
          onClose={handleModalClose}
          coverletterId={selectedCoverletterId}
          onSave={handleCoverletterUpdate}
        />
      )}
    </LayoutMain>
  );
} 