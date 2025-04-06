'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { coverletterApi } from '@/lib/api/coverletter';
import { CoverLetter } from '@/types/api';
import toast from 'react-hot-toast';
import LayoutMain from '@/components/layout/LayoutMain';

type StructuredCoverLetterContent = {
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

export default function CoverletterEditPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [coverletter, setCoverletter] = useState<CoverLetter | null>(null);
  const [formData, setFormData] = useState<StructuredCoverLetterContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    fetchCoverletter();
  }, [session, router, params.id]);

  const fetchCoverletter = async () => {
    try {
      setIsLoading(true);
      const response = await coverletterApi.getById(params.id);
      
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
      toast.error('Fehler beim Laden des Anschreibens');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverletter || !formData || !session?.user?.email) return;

    try {
      setIsSaving(true);
      
      const response = await coverletterApi.patch(params.id, {
        operations: [{
          op: 'replace',
          path: '/structured_coverletter',
          value: {
            cover_letter: formData
          }
        }],
        user_id: session.user.email
      });
      
      if (response.status === 'success' && response.data) {
        setCoverletter(response.data);
        toast.success('Anschreiben erfolgreich gespeichert');
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

  const handleDelete = async () => {
    if (!confirm('Möchten Sie dieses Anschreiben wirklich löschen?')) {
      return;
    }

    try {
      if (!session?.user?.email) {
        throw new Error('Nicht authentifiziert');
      }
      await coverletterApi.delete(params.id, session.user.email);
      toast.success('Anschreiben erfolgreich gelöscht');
      router.push('/coverletter');
    } catch (error) {
      console.error('Fehler beim Löschen des Anschreibens:', error);
      toast.error('Fehler beim Löschen des Anschreibens');
    }
  };

  if (!session) {
    return null;
  }

  if (isLoading) {
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
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Anschreiben bearbeiten</h1>
          <button
            onClick={() => router.push('/coverletter')}
            className="btn btn-ghost"
          >
            Zurück
          </button>
        </div>

        {formData && (
          <form onSubmit={handleSubmit} className=" space-y-6">
            {/* Absender */}
            <div className="flex w-full flex-row">
              <div className="flex w-1/2 flex-col">
                <div className="flex flex-col p-4">
                  <h4 className="font-semibold mb-2">Absender</h4>
                    <div className="flex flex-row">
                      <label className="label w-1/5 mb-2">Name</label>
                      <input
                        type="text"
                        className="input border-0 bg-base-200/50 mb-2 w-4/5 hover:bg-base-200/70 focus:bg-blue-100/70"
                        value={formData.sender.name}
                        onChange={(e) => handleInputChange('sender.name', e.target.value)}
                      />
                    </div>
                    <div className="flex flex-row">
                      <label className="label w-1/5 mb-2">Adresse</label>
                      <input
                        type="text"
                        className="input border-0 bg-base-200/50 mb-2 w-4/5 hover:bg-base-200/70 focus:bg-blue-100/70"
                        value={formData.sender.address}
                        onChange={(e) => handleInputChange('sender.address', e.target.value)}
                      />
                    </div>
                    <div className="flex flex-row">
                      <label className="label w-1/5 mb-2">Telefon</label>
                      <input
                        type="text"
                        className="input border-0 bg-base-200/50 mb-2 w-4/5 hover:bg-base-200/70 focus:bg-blue-100/70"
                        value={formData.sender.phone}
                        onChange={(e) => handleInputChange('sender.phone', e.target.value)}
                      />
                    </div>
                    <div className="flex flex-row">
                      <label className="label w-1/5 mb-2">E-Mail</label>
                      <input
                        type="email"
                        className="input border-0 bg-base-200/50 mb-2 w-4/5 hover:bg-base-200/70 focus:bg-blue-100/70"
                        value={formData.sender.email}
                        onChange={(e) => handleInputChange('sender.email', e.target.value)}
                      />
                    </div>
                </div>
               
              </div>
              <div className="flex w-1/2 flex-col">
                <div className="flex flex-col p-4">
                  <h4 className="font-semibold mb-2">Empfänger</h4>
                  <div className="flex flex-row">
                    <label className="label w-1/5 mb-2">Name</label>
                    <input
                      type="text"
                      className="input border-0 bg-base-200/50 mb-2 w-4/5 hover:bg-base-200/70 focus:bg-blue-100/70"
                      value={formData.recipient.name}
                      onChange={(e) => handleInputChange('recipient.name', e.target.value)}
                    />
                  </div>
                  <div className="flex flex-row">
                    <label className="label w-1/5 mb-2">Firma</label>
                    <input
                      type="text"
                      className="input border-0 bg-base-200/50 mb-2 w-4/5 hover:bg-base-200/70 focus:bg-blue-100/70"
                      value={formData.recipient.company}
                      onChange={(e) => handleInputChange('recipient.company', e.target.value)}
                      />
                  </div>
                    <div className="flex flex-row">
                      <label className="label w-1/5 mb-2">Adresse</label>
                      <input
                        type="text"
                        className="input border-0 bg-base-200/50 mb-2 w-4/5 hover:bg-base-200/70 focus:bg-blue-100/70"
                        value={formData.recipient.address}
                        onChange={(e) => handleInputChange('recipient.address', e.target.value)}
                      />
                    </div>
                    <div className="flex flex-row">
                      <label className="label w-1/5 mb-2">Datum</label>
                      <input
                        type="text"
                        className="input border-0 bg-base-200/50 mb-2 w-4/5 hover:bg-base-200/70 focus:bg-blue-100/70"
                        value={formData.date}
                        onChange={(e) => handleInputChange('date', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
              </div>
           
            {/* Betreff und Referenz */}
            <div className="flex flex-col p-4">
              <div className="flex flex-row mb-4">
                <label className="label w-1/12">Betreff</label>
                <input
                  type="text"
                  className="input border-0 bg-base-200/50 w-11/12 hover:bg-base-200/70 focus:bg-blue-100/70"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                />
              </div>
              <div className="flex flex-row mb-4">
                <label className="label w-1/12">Referenz</label>
                <input
                  type="text"
                  className="input border-0 bg-base-200/50 w-11/12 hover:bg-base-200/70 focus:bg-blue-100/70"
                  value={formData.reference}
                  onChange={(e) => handleInputChange('reference', e.target.value)}
                />
              </div>
              <div className="flex flex-row">
                <label className="label w-1/12">Anrede</label>
                <input
                  type="text"
                  className="input border-0 bg-base-200/50 w-11/12 hover:bg-base-200/70 focus:bg-blue-100/70"
                  value={formData.salutation}
                  onChange={(e) => handleInputChange('salutation', e.target.value)}
                />
              </div>
            </div>

            {/* Paragraphen */}
            <div className="card p-4">
              <h4 className="font-semibold mb-2">Inhalt</h4>
              <div className="space-y-4">
                <div>
                  <label className="label">Einleitung</label>
                  <textarea
                    className="textarea bg-base-200/50 w-full h-32"
                    value={formData.paragraphs.introduction}
                    onChange={(e) => handleInputChange('paragraphs.introduction', e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Motivation</label>
                  <textarea
                    className="textarea bg-base-200/50 w-full h-32"
                    value={formData.paragraphs.motivation}
                    onChange={(e) => handleInputChange('paragraphs.motivation', e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Erfahrung</label>
                  <textarea
                    className="textarea bg-base-200/50 w-full h-32"
                    value={formData.paragraphs.experience_summary}
                    onChange={(e) => handleInputChange('paragraphs.experience_summary', e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Unternehmensausrichtung</label>
                  <textarea
                    className="textarea bg-base-200/50 w-full h-32"
                    value={formData.paragraphs.company_alignment}
                    onChange={(e) => handleInputChange('paragraphs.company_alignment', e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Mehrwert</label>
                  <textarea
                    className="textarea bg-base-200/50 w-full h-32"
                    value={formData.paragraphs.added_value}
                    onChange={(e) => handleInputChange('paragraphs.added_value', e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Gehaltsvorstellung</label>
                  <textarea
                    className="textarea bg-base-200/50 w-full h-32"
                    value={formData.paragraphs.salary_expectation}
                    onChange={(e) => handleInputChange('paragraphs.salary_expectation', e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Schluss</label>
                  <textarea
                    className="textarea bg-base-200/50 w-full h-32"
                    value={formData.paragraphs.closing}
                    onChange={(e) => handleInputChange('paragraphs.closing', e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Unterschrift</label>
                  <textarea
                    className="textarea bg-base-200/50 w-full h-32"
                    value={formData.paragraphs.signature}
                    onChange={(e) => handleInputChange('paragraphs.signature', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={handleDelete}
                className="btn btn-error"
              >
                Löschen
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
        )}
      </div>
    </LayoutMain>
  );
} 