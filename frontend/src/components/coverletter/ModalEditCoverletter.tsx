'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { coverletterApi } from '@/lib/api/coverletter';
import { CoverLetter, UpdateCoverLetterRequest } from '@/types/api';
import toast from 'react-hot-toast';

interface ModalEditCoverletterProps {
  isOpen: boolean;
  onClose: () => void;
  coverletterId: string;
  onSave: (updatedCoverletter: CoverLetter) => void;
}

export function ModalEditCoverletter({
  isOpen,
  onClose,
  coverletterId,
  onSave
}: ModalEditCoverletterProps) {
  const { data: session } = useSession();
  const [title, setTitle] = useState('');
  const [rawText, setRawText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCoverletter = async () => {
      if (!session?.user?.email || !coverletterId) return;

      try {
        setIsLoading(true);
        const response = await coverletterApi.getById(coverletterId);
        
        if (response.status === 'success' && response.data) {
          setTitle(response.data.title);
          setRawText(response.data.rawText);
        }
      } catch (error: any) {
        console.error('Fehler beim Laden:', error);
        toast.error('Fehler beim Laden des Lebenslaufs');
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchCoverletter();
    }
  }, [isOpen, coverletterId, session?.user?.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.email) {
      toast.error('Bitte melden Sie sich an');
      return;
    }

    try {
      setIsSubmitting(true);
      const updates: UpdateCoverLetterRequest = {
        title,
        rawText,
      };

      const response = await coverletterApi.patch(coverletterId, updates, session.user.email);
      
      if (response.status === 'success' && response.data) {
        toast.success('Lebenslauf erfolgreich aktualisiert');
        onSave(response.data);
        onClose();
      } else {
        throw new Error('Fehler beim Aktualisieren des Lebenslaufs');
      }
    } catch (error: any) {
      console.error('Fehler beim Aktualisieren:', error);
      toast.error(error.message || 'Fehler beim Aktualisieren des Lebenslaufs');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Lebenslauf bearbeiten</h3>
        {isLoading ? (
          <div className="flex justify-center">
            <div className="loading loading-spinner loading-lg"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Titel</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Inhalt</span>
              </label>
              <textarea
                className="textarea textarea-bordered h-32"
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                required
              />
            </div>
            <div className="modal-action">
              <button
                type="button"
                className="btn"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="loading loading-spinner loading-xs"></span>
                    Speichern...
                  </>
                ) : (
                  'Speichern'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 