'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { coverletterApi } from '@/lib/api/coverletter';
import toast from 'react-hot-toast';

interface ModalCreateCoverletterProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ModalCreateCoverletter({
  isOpen,
  onClose,
  onSuccess
}: ModalCreateCoverletterProps) {
  const { data: session } = useSession();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.email) {
      toast.error('Bitte melden Sie sich an');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await coverletterApi.create({
        title,
        rawText: content,
        language: 'de'
      });

      if (response.status === 'success' && response.data) {
        onSuccess();
        handleClose();
      } else {
        throw new Error('Fehler beim Erstellen des Anschreibens');
      }
    } catch (error: any) {
      console.error('Fehler beim Erstellen:', error);
      toast.error(error.message || 'Fehler beim Erstellen des Anschreibens');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setContent('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={handleClose} />
        
        <div className="relative w-full max-w-2xl rounded-lg bg-base-100 p-6 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-medium">Neues Anschreiben erstellen</h3>
            <button onClick={handleClose} className="btn btn-ghost btn-sm">
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="mb-2 block text-sm font-medium">
                Titel
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input input-bordered w-full"
                placeholder="z.B. Anschreiben Software Entwickler"
                required
              />
            </div>

            <div>
              <label htmlFor="content" className="mb-2 block text-sm font-medium">
                Inhalt
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="textarea textarea-bordered h-64 w-full"
                placeholder="Fügen Sie hier Ihr Anschreiben ein..."
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="btn btn-ghost"
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
                    <span className="loading loading-spinner loading-sm"></span>
                    Wird erstellt...
                  </>
                ) : (
                  'Erstellen'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 