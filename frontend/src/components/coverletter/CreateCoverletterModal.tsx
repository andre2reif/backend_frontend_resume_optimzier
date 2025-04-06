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
      toast.error(error.message || 'Fehler beim Erstellen des Anschreibens');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
        
        <div className="relative transform overflow-hidden rounded-lg bg-base-100 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={onClose}
          >
            ✕
          </button>

          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 className="text-lg font-semibold leading-6 text-base-content">
                Neues Anschreiben erstellen
              </h3>
              <form onSubmit={handleSubmit} className="mt-4">
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Titel</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input input-bordered w-full"
                    placeholder="Titel des Anschreibens"
                    required
                  />
                </div>
                <div className="form-control w-full mt-4">
                  <label className="label">
                    <span className="label-text">Inhalt</span>
                  </label>
                  <textarea
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    className="textarea textarea-bordered h-32"
                    placeholder="Inhalt des Anschreibens"
                    required
                  />
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="btn btn-primary w-full sm:ml-3 sm:w-auto"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Wird erstellt...' : 'Erstellen'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost mt-3 w-full sm:mt-0 sm:w-auto"
                    onClick={onClose}
                  >
                    Abbrechen
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 