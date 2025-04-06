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

interface StructuredCoverLetter {
  sender: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  recipient: {
    name: string;
    company: string;
    address: string;
  };
  date: string;
  subject: string;
  reference: string;
  salutation: string;
  paragraphs: {
    introduction: string;
    motivation: string;
    experience_summary: string;
    company_alignment: string;
    added_value: string;
    salary_expectation: string;
    closing: string;
    signature: string;
  };
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverletter, setCoverletter] = useState<CoverLetter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<StructuredCoverLetter | null>(null);

  useEffect(() => {
    if (isOpen && coverletterId) {
      fetchCoverletter();
    }
  }, [isOpen, coverletterId]);

  const fetchCoverletter = async () => {
    try {
      setIsLoading(true);
      const response = await coverletterApi.getById(coverletterId);
      
      if (response.status === 'success' && response.data) {
        setCoverletter(response.data);
        if (response.data.structured_coverletter?.cover_letter) {
          setFormData(response.data.structured_coverletter.cover_letter);
        }
      } else {
        throw new Error('Keine Daten vom Server erhalten');
      }
    } catch (error) {
      console.error('Fehler beim Laden des Anschreibens:', error);
      setError('Fehler beim Laden des Anschreibens');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverletter || !formData || !session?.user?.email) return;

    try {
      setIsSaving(true);
      
      const operations = [{
        op: 'replace' as const,
        path: '/structured_coverletter',
        value: {
          cover_letter: formData
        }
      }];

      const response = await coverletterApi.patch(coverletterId, {
        operations,
        user_id: session.user.email
      });
      
      if (response.status === 'success' && response.data) {
        onSave(response.data);
        toast.success('Anschreiben erfolgreich gespeichert');
        onClose();
      } else {
        throw new Error('Fehler beim Speichern');
      }
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      toast.error('Fehler beim Speichern des Anschreibens');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (path: string, value: string) => {
    if (!formData) return;

    const pathParts = path.split('.');
    let current: any = formData;
    
    for (let i = 0; i < pathParts.length - 1; i++) {
      current = current[pathParts[i]];
    }
    
    current[pathParts[pathParts.length - 1]] = value;
    setFormData({ ...formData });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
        
        <div className="relative transform overflow-hidden rounded-lg bg-base-100 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={onClose}
          >
            ✕
          </button>

          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 className="text-lg font-semibold leading-6 text-base-content">
                Anschreiben bearbeiten
              </h3>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="loading loading-spinner loading-lg"></div>
                </div>
              ) : error ? (
                <div className="alert alert-error">
                  <span>{error}</span>
                </div>
              ) : formData ? (
                <form onSubmit={handleSubmit} className="mt-4">
                  {/* Absender */}
                  <div className="card bg-base-200 p-4">
                    <h4 className="font-semibold mb-2">Absender</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label">Name</label>
                        <input
                          type="text"
                          className="input input-bordered w-full"
                          value={formData.sender.name}
                          onChange={(e) => handleInputChange('sender.name', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="label">Adresse</label>
                        <input
                          type="text"
                          className="input input-bordered w-full"
                          value={formData.sender.address}
                          onChange={(e) => handleInputChange('sender.address', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="label">Telefon</label>
                        <input
                          type="text"
                          className="input input-bordered w-full"
                          value={formData.sender.phone}
                          onChange={(e) => handleInputChange('sender.phone', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="label">E-Mail</label>
                        <input
                          type="email"
                          className="input input-bordered w-full"
                          value={formData.sender.email}
                          onChange={(e) => handleInputChange('sender.email', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Empfänger */}
                  <div className="card bg-base-200 p-4">
                    <h4 className="font-semibold mb-2">Empfänger</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label">Name</label>
                        <input
                          type="text"
                          className="input input-bordered w-full"
                          value={formData.recipient.name}
                          onChange={(e) => handleInputChange('recipient.name', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="label">Firma</label>
                        <input
                          type="text"
                          className="input input-bordered w-full"
                          value={formData.recipient.company}
                          onChange={(e) => handleInputChange('recipient.company', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="label">Adresse</label>
                        <input
                          type="text"
                          className="input input-bordered w-full"
                          value={formData.recipient.address}
                          onChange={(e) => handleInputChange('recipient.address', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="label">Datum</label>
                        <input
                          type="text"
                          className="input input-bordered w-full"
                          value={formData.date}
                          onChange={(e) => handleInputChange('date', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Betreff und Referenz */}
                  <div className="card bg-base-200 p-4">
                    <h4 className="font-semibold mb-2">Details</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="label">Betreff</label>
                        <input
                          type="text"
                          className="input input-bordered w-full"
                          value={formData.subject}
                          onChange={(e) => handleInputChange('subject', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="label">Referenz</label>
                        <input
                          type="text"
                          className="input input-bordered w-full"
                          value={formData.reference}
                          onChange={(e) => handleInputChange('reference', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="label">Anrede</label>
                        <input
                          type="text"
                          className="input input-bordered w-full"
                          value={formData.salutation}
                          onChange={(e) => handleInputChange('salutation', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Paragraphen */}
                  <div className="card bg-base-200 p-4">
                    <h4 className="font-semibold mb-2">Inhalt</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="label">Einleitung</label>
                        <textarea
                          className="textarea textarea-bordered w-full h-32"
                          value={formData.paragraphs.introduction}
                          onChange={(e) => handleInputChange('paragraphs.introduction', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="label">Motivation</label>
                        <textarea
                          className="textarea textarea-bordered w-full h-32"
                          value={formData.paragraphs.motivation}
                          onChange={(e) => handleInputChange('paragraphs.motivation', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="label">Erfahrung</label>
                        <textarea
                          className="textarea textarea-bordered w-full h-32"
                          value={formData.paragraphs.experience_summary}
                          onChange={(e) => handleInputChange('paragraphs.experience_summary', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="label">Unternehmensausrichtung</label>
                        <textarea
                          className="textarea textarea-bordered w-full h-32"
                          value={formData.paragraphs.company_alignment}
                          onChange={(e) => handleInputChange('paragraphs.company_alignment', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="label">Mehrwert</label>
                        <textarea
                          className="textarea textarea-bordered w-full h-32"
                          value={formData.paragraphs.added_value}
                          onChange={(e) => handleInputChange('paragraphs.added_value', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="label">Gehaltsvorstellung</label>
                        <textarea
                          className="textarea textarea-bordered w-full h-32"
                          value={formData.paragraphs.salary_expectation}
                          onChange={(e) => handleInputChange('paragraphs.salary_expectation', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="label">Schluss</label>
                        <textarea
                          className="textarea textarea-bordered w-full h-32"
                          value={formData.paragraphs.closing}
                          onChange={(e) => handleInputChange('paragraphs.closing', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="label">Unterschrift</label>
                        <textarea
                          className="textarea textarea-bordered w-full h-32"
                          value={formData.paragraphs.signature}
                          onChange={(e) => handleInputChange('paragraphs.signature', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="modal-action">
                    <button
                      type="button"
                      className="btn"
                      onClick={onClose}
                      disabled={isSaving}
                    >
                      Abbrechen
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <span className="loading loading-spinner loading-sm mr-2"></span>
                          Wird gespeichert...
                        </>
                      ) : (
                        'Speichern'
                      )}
                    </button>
                  </div>
                </form>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 