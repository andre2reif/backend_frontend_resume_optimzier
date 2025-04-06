'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { resumeApi } from '@/lib/api/resume';
import { Resume, PatchOperation } from '@/types/api';
import { XMarkIcon, DocumentTextIcon, BriefcaseIcon, AcademicCapIcon, LanguageIcon, StarIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import PDFDownloadButton from '@/components/pdf/PDFDownloadButton';
import LayoutMain from '@/components/layout/LayoutMain';

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
    start_date: string;
    end_date: string | null;
    is_current: boolean;
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

export default function ResumeEditPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [resume, setResume] = useState<Resume | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('summary');
  const [showDiff, setShowDiff] = useState(false);
  const [diffOperations, setDiffOperations] = useState<PatchOperation[]>([]);
  const [originalResume, setOriginalResume] = useState<Resume | null>(null);

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    fetchResume();
  }, [session, router, params.id]);

  const fetchResume = async () => {
    try {
      setIsLoading(true);
      const response = await resumeApi.getById(params.id);
      if (response.status === 'success' && response.data) {
        setResume(response.data);
        setOriginalResume(response.data);
      } else {
        throw new Error('Keine Daten vom Server erhalten');
      }
    } catch (error) {
      console.error('Fehler beim Laden des Lebenslaufs:', error);
      toast.error('Fehler beim Laden des Lebenslaufs');
      router.push('/resume');
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

  const handleSubmit = async () => {
    if (!resume?._id || !originalResume) {
      console.error('Kein Resume ID oder Original-Resume gefunden');
      return;
    }

    try {
      setIsSaving(true);
      
      const response = await resumeApi.patch(resume._id, originalResume, resume);
      
      if (response.status === 'success' && response.data) {
        setResume(response.data);
        setOriginalResume(response.data);
        toast.success('Lebenslauf erfolgreich gespeichert');
        setShowDiff(false);
      } else {
        throw new Error(response.message || 'Fehler beim Speichern');
      }
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      toast.error('Fehler beim Speichern des Lebenslaufs');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Möchten Sie diesen Lebenslauf wirklich löschen?')) {
      return;
    }

    try {
      await resumeApi.delete(params.id);
      toast.success('Lebenslauf erfolgreich gelöscht');
      router.push('/resume');
    } catch (error) {
      console.error('Fehler beim Löschen des Lebenslaufs:', error);
      toast.error('Fehler beim Löschen des Lebenslaufs');
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

    const sortedCareer = [...career].sort((a, b) => {
      if (a.is_current && !b.is_current) return -1;
      if (!a.is_current && b.is_current) return 1;
      return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
    });

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
        if (!resume?.structured_resume?.career) {
          const initialCareer = {
            position: '',
            company: '',
            start_date: '',
            end_date: null,
            is_current: false,
            tasks: [],
            achievements: []
          };

          return (
            <div className="card p-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold">Berufserfahrung</h4>
                <button
                  type="button"
                  onClick={() => {
                    setResume({
                      ...resume,
                      structured_resume: {
                        ...resume?.structured_resume,
                        career: [initialCareer]
                      }
                    });
                  }}
                  className="btn btn-sm btn-primary"
                >
                  Neue Position hinzufügen
                </button>
              </div>
            </div>
          );
        }

        return (
          <div className="card p-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold">Berufserfahrung</h4>
              <button
                type="button"
                onClick={() => {
                  const initialCareer = {
                    position: '',
                    company: '',
                    start_date: '',
                    end_date: null,
                    is_current: false,
                    tasks: [],
                    achievements: []
                  };

                  setResume({
                    ...resume,
                    structured_resume: {
                      ...resume.structured_resume,
                      career: [...career, initialCareer]
                    }
                  });
                }}
                className="btn btn-sm btn-primary"
              >
                Neue Position hinzufügen
              </button>
            </div>
            <div className="space-y-6">
              {sortedCareer.map((job, index) => (
                <div key={index} className="card bg-base-200 p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h5 className="font-medium">Position {index + 1}</h5>
                    <button
                      type="button"
                      onClick={() => {
                        const updatedStructuredResume = {
                          ...resume.structured_resume,
                          career: resume.structured_resume.career.filter((_, i) => i !== index)
                        };
                        setResume({
                          ...resume,
                          structured_resume: updatedStructuredResume
                        });
                      }}
                      className="btn btn-sm btn-error"
                    >
                      Position löschen
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="label">Position</label>
                      <input
                        type="text"
                        className="input input-bordered w-full"
                        value={job.position}
                        onChange={(e) => {
                          const updatedStructuredResume = {
                            ...resume.structured_resume,
                            career: resume.structured_resume.career.map((j, i) => 
                              i === index ? { ...j, position: e.target.value } : j
                            )
                          };
                          setResume({
                            ...resume,
                            structured_resume: updatedStructuredResume
                          });
                        }}
                      />
                    </div>
                    <div>
                      <label className="label">Unternehmen</label>
                      <input
                        type="text"
                        className="input input-bordered w-full"
                        value={job.company}
                        onChange={(e) => {
                          const updatedStructuredResume = {
                            ...resume.structured_resume,
                            career: resume.structured_resume.career.map((j, i) => 
                              i === index ? { ...j, company: e.target.value } : j
                            )
                          };
                          setResume({
                            ...resume,
                            structured_resume: updatedStructuredResume
                          });
                        }}
                      />
                    </div>
                    <div>
                      <label className="label">Zeitraum</label>
                      <div className="space-y-4">
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <label className="label label-text">Startdatum</label>
                            <input
                              type="date"
                              className="input input-bordered w-full"
                              value={job.start_date}
                              onChange={(e) => {
                                const updatedStructuredResume = {
                                  ...resume.structured_resume,
                                  career: resume.structured_resume.career.map((j, i) => 
                                    i === index ? { ...j, start_date: e.target.value } : j
                                  )
                                };
                                setResume({
                                  ...resume,
                                  structured_resume: updatedStructuredResume
                                });
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <label className="label label-text">Enddatum</label>
                            <input
                              type="date"
                              className="input input-bordered w-full"
                              value={job.end_date || ''}
                              disabled={job.is_current}
                              onChange={(e) => {
                                const updatedStructuredResume = {
                                  ...resume.structured_resume,
                                  career: resume.structured_resume.career.map((j, i) => 
                                    i === index ? { ...j, end_date: e.target.value } : j
                                  )
                                };
                                setResume({
                                  ...resume,
                                  structured_resume: updatedStructuredResume
                                });
                              }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            className="checkbox"
                            checked={job.is_current}
                            onChange={(e) => {
                              const updatedStructuredResume = {
                                ...resume.structured_resume,
                                career: resume.structured_resume.career.map((j, i) => 
                                  i === index ? { 
                                    ...j, 
                                    is_current: e.target.checked,
                                    end_date: e.target.checked ? null : j.end_date
                                  } : j
                                )
                              };
                              setResume({
                                ...resume,
                                structured_resume: updatedStructuredResume
                              });
                            }}
                          />
                          <span className="label-text">Aktuelle Position</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="label">Aufgaben</label>
                      <div className="space-y-2">
                        {job.tasks.map((task, taskIndex) => (
                          <div key={taskIndex} className="flex gap-2">
                            <input
                              type="text"
                              className="input input-bordered flex-1"
                              value={task}
                              onChange={(e) => {
                                const updatedStructuredResume = {
                                  ...resume.structured_resume,
                                  career: resume.structured_resume.career.map((j, i) => 
                                    i === index ? {
                                      ...j,
                                      tasks: j.tasks.map((t, ti) => 
                                        ti === taskIndex ? e.target.value : t
                                      )
                                    } : j
                                  )
                                };
                                setResume({
                                  ...resume,
                                  structured_resume: updatedStructuredResume
                                });
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const updatedStructuredResume = {
                                  ...resume.structured_resume,
                                  career: resume.structured_resume.career.map((j, i) => 
                                    i === index ? {
                                      ...j,
                                      tasks: j.tasks.filter((_, ti) => ti !== taskIndex)
                                    } : j
                                  )
                                };
                                setResume({
                                  ...resume,
                                  structured_resume: updatedStructuredResume
                                });
                              }}
                              className="btn btn-sm btn-error"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            const updatedStructuredResume = {
                              ...resume.structured_resume,
                              career: resume.structured_resume.career.map((j, i) => 
                                i === index ? {
                                  ...j,
                                  tasks: [...j.tasks, '']
                                } : j
                              )
                            };
                            setResume({
                              ...resume,
                              structured_resume: updatedStructuredResume
                            });
                          }}
                          className="btn btn-sm btn-ghost"
                        >
                          + Aufgabe hinzufügen
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="label">Erfolge</label>
                      <div className="space-y-2">
                        {job.achievements.map((achievement, achievementIndex) => (
                          <div key={achievementIndex} className="flex gap-2">
                            <input
                              type="text"
                              className="input input-bordered flex-1"
                              value={achievement}
                              onChange={(e) => {
                                const updatedStructuredResume = {
                                  ...resume.structured_resume,
                                  career: resume.structured_resume.career.map((j, i) => 
                                    i === index ? {
                                      ...j,
                                      achievements: j.achievements.map((a, ai) => 
                                        ai === achievementIndex ? e.target.value : a
                                      )
                                    } : j
                                  )
                                };
                                setResume({
                                  ...resume,
                                  structured_resume: updatedStructuredResume
                                });
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const updatedStructuredResume = {
                                  ...resume.structured_resume,
                                  career: resume.structured_resume.career.map((j, i) => 
                                    i === index ? {
                                      ...j,
                                      achievements: j.achievements.filter((_, ai) => ai !== achievementIndex)
                                    } : j
                                  )
                                };
                                setResume({
                                  ...resume,
                                  structured_resume: updatedStructuredResume
                                });
                              }}
                              className="btn btn-sm btn-error"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            const updatedStructuredResume = {
                              ...resume.structured_resume,
                              career: resume.structured_resume.career.map((j, i) => 
                                i === index ? {
                                  ...j,
                                  achievements: [...j.achievements, '']
                                } : j
                              )
                            };
                            setResume({
                              ...resume,
                              structured_resume: updatedStructuredResume
                            });
                          }}
                          className="btn btn-sm btn-ghost"
                        >
                          + Erfolg hinzufügen
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
          <div>
            <h1 className="text-2xl font-bold">Lebenslauf bearbeiten</h1>
            <p className="mt-2 text-sm text-base-content/80">
              Bearbeiten Sie Ihren Lebenslauf und optimieren Sie ihn für ATS-Systeme.
            </p>
          </div>
          <div className="flex gap-2">
            {resume && (
              <PDFDownloadButton
                resume={resume}
                className="btn btn-primary"
              />
            )}
            <button
              onClick={() => router.push('/resume')}
              className="btn btn-ghost"
            >
              Zurück
            </button>
          </div>
        </div>

        {resume && (
          <div className="space-y-6">
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

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={handleDelete}
                className="btn btn-error"
              >
                Löschen
              </button>
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
                  onClick={handleSubmit}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <span className="loading loading-spinner loading-sm mr-2"></span>
                      Wird gespeichert...
                    </>
                  ) : (
                    'Änderungen speichern'
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </LayoutMain>
  );
} 