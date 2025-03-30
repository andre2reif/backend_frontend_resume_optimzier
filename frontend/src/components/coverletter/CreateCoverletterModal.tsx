'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { coverletterApi } from '@/lib/api/coverletter';
import { CreateCoverLetterRequest } from '@/types/api';
import toast from 'react-hot-toast';

interface CreateCoverletterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateCoverletterModal({
  isOpen,
  onClose,
  onSuccess
}: CreateCoverletterModalProps) {
  const { data: session } = useSession();
  const [title, setTitle] = useState('');
  const [rawText, setRawText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.email) {
      toast.error('Bitte melden Sie sich an');
      return;
    }

    try {
      setIsSubmitting(true);
      const data: CreateCoverLetterRequest = {
        title,
        rawText,
        userId: session.user.email
      };

      const response = await coverletterApi.create(data);
      
      if (response) {
        toast.success('Anschreiben erfolgreich erstellt');
        setTitle('');
        setRawText('');
        onSuccess();
        onClose();
      } else {
        throw new Error('Keine Daten vom Server erhalten');
      }
    } catch (error: any) {
      console.error('Fehler beim Erstellen:', error);
      toast.error(error.message || 'Fehler beim Erstellen des Anschreiben');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Neues Anschreiben erstellen</h3>
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
                  Erstellen...
                </>
              ) : (
                'Erstellen'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 