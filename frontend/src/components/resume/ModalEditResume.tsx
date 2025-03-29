'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, DocumentTextIcon, BriefcaseIcon, AcademicCapIcon, LanguageIcon, StarIcon } from '@heroicons/react/24/outline';
import { Resume, UpdateResumeData, PatchOperation } from '@/types/api';
import { resumeApi } from '@/lib/api/resume';
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

type TabType = 'summary' | 'career' | 'skills' | 'education' | 'languages' | 'optionals';

interface OptionalSection {
  title: string;
  items: string[];
}

interface StructuredResume {
  summary?: {
    experience?: string;
    key_aspects?: string[];
  };
  personal_statement?: string;
  career?: {
    position: string;
    company: string;
    time_period: string;
    tasks: string[];
    achievements: string[];
  }[];
  key_skills?: {
    title: string;
    items: {
      category: string;
      skills: string[];
    }[];
  };
  education?: {
    title: string;
    items: string[];
  };
  languages?: {
    title: string;
    items: string[];
  };
  optionals?: OptionalSection[];
}

export default function ModalEditResume({ isOpen, onClose, resumeId, onSave }: ModalEditResumeProps) {
  const [resume, setResume] = useState<Resume | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<DebugData | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('summary');
  const [isSaving, setIsSaving] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [diffOperations, setDiffOperations] = useState<PatchOperation[]>([]);
  const [originalResume, setOriginalResume] = useState<Resume | null>(null);

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
        setOriginalResume(resumeData); // Speichere das originale Resume
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
      if (!session?.user?.email) {
        throw new Error('Nicht authentifiziert');
      }

      setDebugInfo({
        timestamp: new Date().toISOString(),
        resumeId,
        requestUrl: `${API_ENDPOINTS.resumes.update}/${resumeId}?user_id=${encodeURIComponent(session.user.email)}`,
        error: errorMessage,
        errorObject: err
      });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDiff = () => {
    if (!resume || !originalResume) return [];
    
    const operations: PatchOperation[] = [];

    // Vergleiche title
    if (originalResume.title !== resume.title) {
      operations.push({
        op: 'replace',
        path: '/title',
        value: resume.title
      });
    }

    // Vergleiche content
    if (originalResume.content !== resume.content) {
      operations.push({
        op: 'replace',
        path: '/content',
        value: resume.content
      });
    }

    // Vergleiche structured_resume
    if (JSON.stringify(originalResume.structured_resume) !== JSON.stringify(resume.structured_resume)) {
      operations.push({
        op: 'replace',
        path: '/structured_resume',
        value: resume.structured_resume
      });
    }

    return operations;
  };

  const handleCheckChanges = () => {
    const operations = calculateDiff();
    setDiffOperations(operations);
    setShowDiff(true);
  };

  const handlePatch = async () => {
    if (!resume?._id || !originalResume) {
      console.error('Kein Resume ID oder Original-Resume gefunden');
      return;
    }

    try {
      setIsSaving(true);
      
      const response = await resumeApi.patch(resume._id, originalResume, resume);
      console.log('Patch erfolgreich:', response);
      
      if (response.status === 'success' && response.data) {
        onClose();
        if (onSave) {
          onSave(response.data);
        }
      } else {
        throw new Error(response.message || 'Fehler beim Speichern');
      }
    } catch (error) {
      console.error('Fehler beim Patchen:', error);
      toast.error('Fehler beim Aktualisieren des Lebenslaufs');
    } finally {
      setIsSaving(false);
      setShowDiff(false);
    }
  };

  const renderTabContent = () => {
    if (!resume?.structured_resume) return null;

    const structuredResume = resume.structured_resume as StructuredResume;
    const summary = structuredResume.summary || { experience: '', key_aspects: [] };
    const career = structuredResume.career || [];
    const keySkills = structuredResume.key_skills || { title: '', items: [] };
    const education = structuredResume.education || { title: '', items: [] };
    const languages = structuredResume.languages || { title: '', items: [] };
    const optionals = structuredResume.optionals || [];

    switch (activeTab) {
      case 'summary':
        return (
          <div className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Titel</span>
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
                <span className="label-text font-semibold">Erfahrung</span>
              </label>
              <textarea
                className="textarea textarea-bordered h-24"
                value={summary.experience}
                onChange={(e) => setResume({
                  ...resume,
                  structured_resume: {
                    ...structuredResume,
                    summary: {
                      ...summary,
                      experience: e.target.value
                    }
                  }
                })}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Persönliche Erklärung</span>
              </label>
              <textarea
                className="textarea textarea-bordered h-32"
                value={structuredResume.personal_statement || ''}
                onChange={(e) => setResume({
                  ...resume,
                  structured_resume: {
                    ...structuredResume,
                    personal_statement: e.target.value
                  }
                })}
              />
            </div>
          </div>
        );

      case 'career':
        return (
          <div className="space-y-6">
            {career.map((job, index) => (
              <div key={index} className="card bg-base-200 p-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Position</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={job.position}
                    onChange={(e) => {
                      const newCareer = [...career];
                      newCareer[index] = { ...job, position: e.target.value };
                      setResume({
                        ...resume,
                        structured_resume: {
                          ...structuredResume,
                          career: newCareer
                        }
                      });
                    }}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Unternehmen</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={job.company}
                    onChange={(e) => {
                      const newCareer = [...career];
                      newCareer[index] = { ...job, company: e.target.value };
                      setResume({
                        ...resume,
                        structured_resume: {
                          ...structuredResume,
                          career: newCareer
                        }
                      });
                    }}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Zeitraum</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={job.time_period}
                    onChange={(e) => {
                      const newCareer = [...career];
                      newCareer[index] = { ...job, time_period: e.target.value };
                      setResume({
                        ...resume,
                        structured_resume: {
                          ...structuredResume,
                          career: newCareer
                        }
                      });
                    }}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Aufgaben</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered h-24"
                    value={job.tasks.join('\n')}
                    onChange={(e) => {
                      const newCareer = [...career];
                      newCareer[index] = { ...job, tasks: e.target.value.split('\n') };
                      setResume({
                        ...resume,
                        structured_resume: {
                          ...structuredResume,
                          career: newCareer
                        }
                      });
                    }}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Erfolge</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered h-24"
                    value={job.achievements.join('\n')}
                    onChange={(e) => {
                      const newCareer = [...career];
                      newCareer[index] = { ...job, achievements: e.target.value.split('\n') };
                      setResume({
                        ...resume,
                        structured_resume: {
                          ...structuredResume,
                          career: newCareer
                        }
                      });
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        );

      case 'skills':
        return (
          <div className="space-y-6">
            {keySkills.items.map((skillGroup, index) => (
              <div key={index} className="card bg-base-200 p-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Kategorie</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={skillGroup.category}
                    onChange={(e) => {
                      const newSkills = [...keySkills.items];
                      newSkills[index] = { ...skillGroup, category: e.target.value };
                      setResume({
                        ...resume,
                        structured_resume: {
                          ...structuredResume,
                          key_skills: {
                            ...keySkills,
                            items: newSkills
                          }
                        }
                      });
                    }}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Fähigkeiten</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered h-24"
                    value={skillGroup.skills.join('\n')}
                    onChange={(e) => {
                      const newSkills = [...keySkills.items];
                      newSkills[index] = { ...skillGroup, skills: e.target.value.split('\n') };
                      setResume({
                        ...resume,
                        structured_resume: {
                          ...structuredResume,
                          key_skills: {
                            ...keySkills,
                            items: newSkills
                          }
                        }
                      });
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        );

      case 'education':
        return (
          <div className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Ausbildung</span>
              </label>
              <textarea
                className="textarea textarea-bordered h-32"
                value={education.items.join('\n')}
                onChange={(e) => setResume({
                  ...resume,
                  structured_resume: {
                    ...structuredResume,
                    education: {
                      ...education,
                      items: e.target.value.split('\n')
                    }
                  }
                })}
              />
            </div>
          </div>
        );

      case 'languages':
        return (
          <div className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Sprachen</span>
              </label>
              <textarea
                className="textarea textarea-bordered h-32"
                value={languages.items.join('\n')}
                onChange={(e) => setResume({
                  ...resume,
                  structured_resume: {
                    ...structuredResume,
                    languages: {
                      ...languages,
                      items: e.target.value.split('\n')
                    }
                  }
                })}
              />
            </div>
          </div>
        );

      case 'optionals':
        return (
          <div className="space-y-6">
            {optionals.map((optional: OptionalSection, index: number) => (
              <div key={index} className="card bg-base-200 p-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Titel</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={optional.title}
                    onChange={(e) => {
                      const newOptionals = [...optionals];
                      newOptionals[index] = { ...optional, title: e.target.value };
                      setResume({
                        ...resume,
                        structured_resume: {
                          ...structuredResume,
                          optionals: newOptionals
                        }
                      });
                    }}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Einträge</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered h-32"
                    value={optional.items.join('\n')}
                    onChange={(e) => {
                      const newOptionals = [...optionals];
                      newOptionals[index] = { ...optional, items: e.target.value.split('\n') };
                      setResume({
                        ...resume,
                        structured_resume: {
                          ...structuredResume,
                          optionals: newOptionals
                        }
                      });
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return null;
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
            {/* Tabs */}
            <div className="tabs tabs-boxed">
              <button
                className={`tab ${activeTab === 'summary' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('summary')}
              >
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                Zusammenfassung
              </button>
              <button
                className={`tab ${activeTab === 'career' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('career')}
              >
                <BriefcaseIcon className="h-5 w-5 mr-2" />
                Berufserfahrung
              </button>
              <button
                className={`tab ${activeTab === 'skills' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('skills')}
              >
                <StarIcon className="h-5 w-5 mr-2" />
                Fähigkeiten
              </button>
              <button
                className={`tab ${activeTab === 'education' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('education')}
              >
                <AcademicCapIcon className="h-5 w-5 mr-2" />
                Ausbildung
              </button>
              <button
                className={`tab ${activeTab === 'languages' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('languages')}
              >
                <LanguageIcon className="h-5 w-5 mr-2" />
                Sprachen
              </button>
              <button
                className={`tab ${activeTab === 'optionals' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('optionals')}
              >
                <StarIcon className="h-5 w-5 mr-2" />
                Zusätzliches
              </button>
            </div>

            {/* Tab Content */}
            <div className="mt-4">
              {renderTabContent()}
            </div>

            {/* Diff-Anzeige */}
            {showDiff && diffOperations.length > 0 && (
              <div className="my-4 p-4 bg-base-200 rounded-lg">
                <h4 className="font-bold mb-2">Geplante Änderungen:</h4>
                <pre className="text-sm whitespace-pre-wrap">
                  {JSON.stringify(diffOperations, null, 2)}
                </pre>
              </div>
            )}

            <div className="modal-action">
              <button className="btn" onClick={onClose}>Abbrechen</button>
              <button 
                className="btn btn-secondary" 
                onClick={handleCheckChanges}
                disabled={isSaving}
              >
                Änderungen prüfen
              </button>
              {showDiff && diffOperations.length > 0 && (
                <button 
                  className="btn btn-primary" 
                  onClick={handlePatch}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <span className="loading loading-spinner"></span>
                      Speichert...
                    </>
                  ) : (
                    'Änderungen speichern'
                  )}
                </button>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
} 