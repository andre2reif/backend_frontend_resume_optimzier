'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Resume } from '@/types/api';
import { resumeApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { getSession } from 'next-auth/react';
import { API_ENDPOINTS } from '@/config/api';

interface ModalEditResumeProps {
  isOpen: boolean;
  onClose: () => void;
  resumeId: string;
  onSave: (updatedResume: Resume) => void;
}

interface DebugData {
  timestamp: string;
  resumeId: string;
  requestUrl: string;
  response?: any;
  error?: string;
  errorObject?: unknown;
  responseData?: any;
}

export default function ModalEditResume({ isOpen, onClose, resumeId, onSave }: ModalEditResumeProps) {
  const [resume, setResume] = useState<Resume | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<DebugData | null>(null);

  useEffect(() => {
    if (isOpen && resumeId) {
      fetchResume();
    }
  }, [isOpen, resumeId]);

  const fetchResume = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching resume:', resumeId); // Debug log
      
      const session = await getSession();
      if (!session?.user?.email) {
        throw new Error('Nicht authentifiziert');
      }
      
      // Debug-Info sammeln
      const debugData: DebugData = {
        timestamp: new Date().toISOString(),
        resumeId,
        requestUrl: `${API_ENDPOINTS.resumes.getById}/${resumeId}?user_id=${encodeURIComponent(session.user.email)}`
      };
      
      // Direkte API-Anfrage für Debug-Zwecke
      const response = await fetch(debugData.requestUrl);
      const responseText = await response.text();
      console.log('Raw API Response:', responseText); // Debug log
      
      // Versuche die Antwort als JSON zu parsen
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.error('JSON Parse Error:', e);
        throw new Error('Ungültige API-Antwort');
      }
      
      debugData.response = responseData;
      console.log('Parsed API Response:', responseData); // Debug log
      
      if (responseData.status === 'success' && responseData.data) {
        // Setze die Daten aus der API-Antwort
        const resumeData = responseData.data;
        setResume({
          ...resumeData,
          content: resumeData.content || resumeData.rawText || '',
          title: resumeData.title || 'Unbenannt'
        });
        setDebugInfo({
          ...debugData,
          responseData: resumeData
        });
      } else {
        throw new Error(responseData.message || 'Fehler beim Laden des Lebenslaufs');
      }
    } catch (err) {
      console.error('Fehler beim Laden:', err);
      const errorMessage = err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten';
      setError(errorMessage);
      
      const session = await getSession();
      setDebugInfo({
        timestamp: new Date().toISOString(),
        resumeId,
        requestUrl: `${API_ENDPOINTS.resumes.getById}/${resumeId}?user_id=${encodeURIComponent(session?.user?.email || '')}`,
        error: errorMessage,
        errorObject: err
      });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resume) return;

    try {
      // Aktualisiere nur die editierbaren Felder im bestehenden Resume-Objekt
      const updatedResume: Resume = {
        ...resume,
        content: resume.content || ''
      };
      
      await onSave(updatedResume);
      onClose();
    } catch (err) {
      console.error('Fehler beim Speichern:', err);
      toast.error('Fehler beim Speichern des Lebenslaufs');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-5xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Lebenslauf bearbeiten</h3>
          <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Debug-Informationen */}
        {debugInfo && (
          <div className="bg-base-200 p-4 rounded-lg mb-4">
            <h4 className="font-bold mb-2">Debug-Informationen:</h4>
            <pre className="text-xs whitespace-pre-wrap">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : error ? (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        ) : resume ? (
          <div className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Titel</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={resume.title}
                onChange={(e) => setResume({ ...resume, title: e.target.value })}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Inhalt</span>
              </label>
              <textarea
                className="textarea textarea-bordered h-24"
                value={resume.content}
                onChange={(e) => setResume({ ...resume, content: e.target.value })}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Zusammenfassung</span>
              </label>
              <textarea
                className="textarea textarea-bordered h-24"
                value={resume.structured_resume?.summary?.experience || ''}
                onChange={(e) => setResume({
                  ...resume,
                  structured_resume: {
                    ...resume.structured_resume,
                    summary: {
                      ...resume.structured_resume?.summary,
                      experience: e.target.value
                    }
                  }
                })}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Persönliche Erklärung</span>
              </label>
              <textarea
                className="textarea textarea-bordered h-24"
                value={resume.structured_resume?.personal_statement || ''}
                onChange={(e) => setResume({
                  ...resume,
                  structured_resume: {
                    ...resume.structured_resume,
                    personal_statement: e.target.value
                  }
                })}
              />
            </div>

            <div className="modal-action">
              <button className="btn" onClick={onClose}>Abbrechen</button>
              <button className="btn btn-primary" onClick={handleSave}>Speichern</button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
} 