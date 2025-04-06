'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/common/PageHeader';
import toast from 'react-hot-toast';

interface StructuredJobDescription {
  job_title: string;
  company: string;
  location: string;
  remote_option: string;
  salary_range: string;
  job_overview: string;
  responsibilities: string[];
  skills: {
    hard_skills: Array<{ skill: string; importance_level: string }>;
    soft_skills: Array<{ skill: string; importance_level: string }>;
  };
  benefits: string[];
  application_process: {
    contact_person: string;
    contact_details: string;
    steps_to_apply: string;
  };
  additional_information: string;
}

interface JobDescription {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  status: 'unstructured' | 'structured_complete';
  structured_jobdescription?: StructuredJobDescription;
  rawText?: string;
  language?: string;
}

export default function JobDescriptionPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [jobDescription, setJobDescription] = useState<JobDescription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    title: '',
    content: '',
    rawText: '',
    language: '',
    structured_jobdescription: {
      job_title: '',
      company: '',
      location: '',
      remote_option: '',
      salary_range: '',
      job_overview: '',
      responsibilities: [] as string[],
      skills: {
        hard_skills: [] as Array<{ skill: string; importance_level: string }>,
        soft_skills: [] as Array<{ skill: string; importance_level: string }>
      },
      benefits: [] as string[],
      application_process: {
        contact_person: '',
        contact_details: '',
        steps_to_apply: ''
      },
      additional_information: ''
    }
  });

  useEffect(() => {
    if (session?.user?.id) {
      fetchJobDescription();
    }
  }, [session?.user?.id, params.id]);

  const fetchJobDescription = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/jobdescriptions/view/${params.id}?user_id=${session?.user?.id}`);
      if (!response.ok) throw new Error('Fehler beim Laden der Stellenausschreibung');
      
      const data = await response.json();
      setJobDescription(data.data);
      setEditedData({
        title: data.data.title || '',
        content: data.data.content || '',
        rawText: data.data.rawText || '',
        language: data.data.language || '',
        structured_jobdescription: data.data.structured_jobdescription || {
          job_title: '',
          company: '',
          location: '',
          remote_option: '',
          salary_range: '',
          job_overview: '',
          responsibilities: [],
          skills: {
            hard_skills: [],
            soft_skills: []
          },
          benefits: [],
          application_process: {
            contact_person: '',
            contact_details: '',
            steps_to_apply: ''
          },
          additional_information: ''
        }
      });
    } catch (error) {
      console.error('Fehler beim Laden der Stellenausschreibung:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!session?.user?.id) return;

    try {
      // Bereite die Patch-Operationen vor
      const operations = [];
      
      // Basis-Felder
      if (editedData.title !== jobDescription?.title) {
        operations.push({
          op: 'replace',
          path: '/title',
          value: editedData.title
        });
      }
      
      if (editedData.rawText !== jobDescription?.rawText) {
        operations.push({
          op: 'replace',
          path: '/content',
          value: editedData.rawText
        });
      }
      
      if (editedData.language !== jobDescription?.language) {
        operations.push({
          op: 'replace',
          path: '/language',
          value: editedData.language
        });
      }
      
      // Strukturierte Daten
      if (JSON.stringify(editedData.structured_jobdescription) !== JSON.stringify(jobDescription?.structured_jobdescription)) {
        operations.push({
          op: 'replace',
          path: '/structured_jobdescription',
          value: editedData.structured_jobdescription
        });
      }
      
      // Wenn keine Änderungen vorgenommen wurden, beende die Funktion
      if (operations.length === 0) {
        setIsEditing(false);
        return;
      }

      console.log('Sende Patch-Operationen:', operations);

      const response = await fetch(`http://localhost:8000/api/v1/jobdescriptions/patch/${params.id}?user_id=${session.user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ operations }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Fehlerantwort:', errorData);
        
        // Formatiere die Fehlermeldung
        let errorMessage = 'Fehler beim Speichern der Änderungen: ';
        if (errorData.detail && Array.isArray(errorData.detail)) {
          errorMessage += errorData.detail.map((err: any) => 
            typeof err === 'object' ? JSON.stringify(err) : err
          ).join(', ');
        } else if (errorData.detail) {
          errorMessage += typeof errorData.detail === 'object' 
            ? JSON.stringify(errorData.detail) 
            : errorData.detail;
        } else {
          errorMessage += 'Unbekannter Fehler';
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setJobDescription(data.data);
      setIsEditing(false);
      toast.success('Änderungen wurden erfolgreich gespeichert!');
    } catch (error) {
      console.error('Fehler beim Speichern der Änderungen:', error);
      toast.error(error instanceof Error ? error.message : 'Ein unerwarteter Fehler ist aufgetreten');
    }
  };

  const renderStructuredContent = () => {
    if (!jobDescription?.structured_jobdescription) return null;
    const structured = isEditing ? editedData.structured_jobdescription : jobDescription.structured_jobdescription;

    return (
      <div className="space-y-8">
        {/* Übersicht */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Übersicht</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Jobtitel</h3>
              {isEditing ? (
                <input
                  type="text"
                  value={structured.job_title}
                  onChange={(e) => setEditedData(prev => ({
                    ...prev,
                    structured_jobdescription: {
                      ...prev.structured_jobdescription,
                      job_title: e.target.value
                    }
                  }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              ) : (
                <p>{structured.job_title}</p>
              )}
            </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Unternehmen</h3>
              {isEditing ? (
                <input
                  type="text"
                  value={structured.company}
                  onChange={(e) => setEditedData(prev => ({
                    ...prev,
                    structured_jobdescription: {
                      ...prev.structured_jobdescription,
                      company: e.target.value
                    }
                  }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              ) : (
                <p>{structured.company}</p>
            )}
            </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Standort</h3>
              {isEditing ? (
                <input
                  type="text"
                  value={structured.location}
                  onChange={(e) => setEditedData(prev => ({
                    ...prev,
                    structured_jobdescription: {
                      ...prev.structured_jobdescription,
                      location: e.target.value
                    }
                  }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              ) : (
                <p>{structured.location}</p>
            )}
            </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Remote Option</h3>
              {isEditing ? (
                <input
                  type="text"
                  value={structured.remote_option}
                  onChange={(e) => setEditedData(prev => ({
                    ...prev,
                    structured_jobdescription: {
                      ...prev.structured_jobdescription,
                      remote_option: e.target.value
                    }
                  }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              ) : (
                <p>{structured.remote_option}</p>
            )}
            </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Gehaltsspanne</h3>
              {isEditing ? (
                <input
                  type="text"
                  value={structured.salary_range}
                  onChange={(e) => setEditedData(prev => ({
                    ...prev,
                    structured_jobdescription: {
                      ...prev.structured_jobdescription,
                      salary_range: e.target.value
                    }
                  }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              ) : (
                <p>{structured.salary_range}</p>
            )}
            </div>
          </div>
        </section>

        {/* Job Beschreibung */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Beschreibung</h2>
          {isEditing ? (
            <textarea
              value={structured.job_overview}
              onChange={(e) => setEditedData(prev => ({
                ...prev,
                structured_jobdescription: {
                  ...prev.structured_jobdescription,
                  job_overview: e.target.value
                }
              }))}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          ) : (
            <p className="whitespace-pre-wrap">{structured.job_overview}</p>
        )}
        </section>

        {/* Verantwortlichkeiten */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Verantwortlichkeiten</h2>
          {isEditing ? (
            <div className="space-y-2">
              {structured.responsibilities.map((resp, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={resp}
                    onChange={(e) => {
                      const newResponsibilities = [...structured.responsibilities];
                      newResponsibilities[index] = e.target.value;
                      setEditedData(prev => ({
                        ...prev,
                        structured_jobdescription: {
                          ...prev.structured_jobdescription,
                          responsibilities: newResponsibilities
                        }
                      }));
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  <button
                    onClick={() => {
                      const newResponsibilities = structured.responsibilities.filter((_, i) => i !== index);
                      setEditedData(prev => ({
                        ...prev,
                        structured_jobdescription: {
                          ...prev.structured_jobdescription,
                          responsibilities: newResponsibilities
                        }
                      }));
                    }}
                    className="px-2 py-1 text-sm text-red-600 hover:text-red-800"
                  >
                    Entfernen
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  setEditedData(prev => ({
                    ...prev,
                    structured_jobdescription: {
                      ...prev.structured_jobdescription,
                      responsibilities: [...prev.structured_jobdescription.responsibilities, '']
                    }
                  }));
                }}
                className="mt-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
              >
                Verantwortlichkeit hinzufügen
              </button>
            </div>
          ) : (
            <ul className="list-disc pl-5 space-y-2">
              {structured.responsibilities.map((resp, index) => (
                <li key={index}>{resp}</li>
              ))}
            </ul>
        )}
        </section>

        {/* Skills */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Anforderungen</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Hard Skills */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Hard Skills</h3>
              {isEditing ? (
                <div className="space-y-2">
                  {structured.skills.hard_skills.map((skill, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={skill.skill}
                        onChange={(e) => {
                          const newSkills = [...structured.skills.hard_skills];
                          newSkills[index] = { ...skill, skill: e.target.value };
                          setEditedData(prev => ({
                            ...prev,
                            structured_jobdescription: {
                              ...prev.structured_jobdescription,
                              skills: {
                                ...prev.structured_jobdescription.skills,
                                hard_skills: newSkills
                              }
                            }
                          }));
                        }}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                      <select
                        value={skill.importance_level}
                        onChange={(e) => {
                          const newSkills = [...structured.skills.hard_skills];
                          newSkills[index] = { ...skill, importance_level: e.target.value };
                          setEditedData(prev => ({
                            ...prev,
                            structured_jobdescription: {
                              ...prev.structured_jobdescription,
                              skills: {
                                ...prev.structured_jobdescription.skills,
                                hard_skills: newSkills
                              }
                            }
                          }));
                        }}
                        className="mt-1 block w-32 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        <option value="must_have">Pflicht</option>
                        <option value="recommended">Empfohlen</option>
                      </select>
                      <button
                        onClick={() => {
                          const newSkills = structured.skills.hard_skills.filter((_, i) => i !== index);
                          setEditedData(prev => ({
                            ...prev,
                            structured_jobdescription: {
                              ...prev.structured_jobdescription,
                              skills: {
                                ...prev.structured_jobdescription.skills,
                                hard_skills: newSkills
                              }
                            }
                          }));
                        }}
                        className="px-2 py-1 text-sm text-red-600 hover:text-red-800"
                      >
                        Entfernen
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      setEditedData(prev => ({
                        ...prev,
                        structured_jobdescription: {
                          ...prev.structured_jobdescription,
                          skills: {
                            ...prev.structured_jobdescription.skills,
                            hard_skills: [...prev.structured_jobdescription.skills.hard_skills, { skill: '', importance_level: 'must_have' }]
                          }
                        }
                      }));
                    }}
                    className="mt-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
                  >
                    Hard Skill hinzufügen
                  </button>
                </div>
              ) : (
                  <ul className="list-disc pl-5 space-y-2">
                    {structured.skills.hard_skills.map((skill, index) => (
                      <li key={index} className={skill.importance_level === 'must_have' ? 'font-medium' : ''}>
                        {skill.skill}
                        {skill.importance_level === 'must_have' && ' (Pflicht)'}
                      </li>
                    ))}
                  </ul>
              )}
            </div>

            {/* Soft Skills */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Soft Skills</h3>
              {isEditing ? (
                <div className="space-y-2">
                  {structured.skills.soft_skills.map((skill, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={skill.skill}
                        onChange={(e) => {
                          const newSkills = [...structured.skills.soft_skills];
                          newSkills[index] = { ...skill, skill: e.target.value };
                          setEditedData(prev => ({
                            ...prev,
                            structured_jobdescription: {
                              ...prev.structured_jobdescription,
                              skills: {
                                ...prev.structured_jobdescription.skills,
                                soft_skills: newSkills
                              }
                            }
                          }));
                        }}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                      <select
                        value={skill.importance_level}
                        onChange={(e) => {
                          const newSkills = [...structured.skills.soft_skills];
                          newSkills[index] = { ...skill, importance_level: e.target.value };
                          setEditedData(prev => ({
                            ...prev,
                            structured_jobdescription: {
                              ...prev.structured_jobdescription,
                              skills: {
                                ...prev.structured_jobdescription.skills,
                                soft_skills: newSkills
                              }
                            }
                          }));
                        }}
                        className="mt-1 block w-32 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        <option value="must_have">Pflicht</option>
                        <option value="recommended">Empfohlen</option>
                      </select>
                      <button
                        onClick={() => {
                          const newSkills = structured.skills.soft_skills.filter((_, i) => i !== index);
                          setEditedData(prev => ({
                            ...prev,
                            structured_jobdescription: {
                              ...prev.structured_jobdescription,
                              skills: {
                                ...prev.structured_jobdescription.skills,
                                soft_skills: newSkills
                              }
                            }
                          }));
                        }}
                        className="px-2 py-1 text-sm text-red-600 hover:text-red-800"
                      >
                        Entfernen
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      setEditedData(prev => ({
                        ...prev,
                        structured_jobdescription: {
                          ...prev.structured_jobdescription,
                          skills: {
                            ...prev.structured_jobdescription.skills,
                            soft_skills: [...prev.structured_jobdescription.skills.soft_skills, { skill: '', importance_level: 'must_have' }]
                          }
                        }
                      }));
                    }}
                    className="mt-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
                  >
                    Soft Skill hinzufügen
                  </button>
                </div>
              ) : (
                  <ul className="list-disc pl-5 space-y-2">
                    {structured.skills.soft_skills.map((skill, index) => (
                      <li key={index} className={skill.importance_level === 'must_have' ? 'font-medium' : ''}>
                        {skill.skill}
                        {skill.importance_level === 'must_have' && ' (Pflicht)'}
                      </li>
                    ))}
                  </ul>
              )}
            </div>
            </div>
          </section>

        {/* Benefits */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Benefits</h2>
          {isEditing ? (
            <div className="space-y-2">
              {structured.benefits.map((benefit, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={benefit}
                    onChange={(e) => {
                      const newBenefits = [...structured.benefits];
                      newBenefits[index] = e.target.value;
                      setEditedData(prev => ({
                        ...prev,
                        structured_jobdescription: {
                          ...prev.structured_jobdescription,
                          benefits: newBenefits
                        }
                      }));
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  <button
                    onClick={() => {
                      const newBenefits = structured.benefits.filter((_, i) => i !== index);
                      setEditedData(prev => ({
                        ...prev,
                        structured_jobdescription: {
                          ...prev.structured_jobdescription,
                          benefits: newBenefits
                        }
                      }));
                    }}
                    className="px-2 py-1 text-sm text-red-600 hover:text-red-800"
                  >
                    Entfernen
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  setEditedData(prev => ({
                    ...prev,
                    structured_jobdescription: {
                      ...prev.structured_jobdescription,
                      benefits: [...prev.structured_jobdescription.benefits, '']
                    }
                  }));
                }}
                className="mt-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
              >
                Benefit hinzufügen
              </button>
            </div>
          ) : (
            <ul className="list-disc pl-5 space-y-2">
              {structured.benefits.map((benefit, index) => (
                <li key={index}>{benefit}</li>
              ))}
            </ul>
        )}
        </section>

        {/* Bewerbungsprozess */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Bewerbungsprozess</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Ansprechpartner</h3>
              {isEditing ? (
                <input
                  type="text"
                  value={structured.application_process.contact_person}
                  onChange={(e) => setEditedData(prev => ({
                    ...prev,
                    structured_jobdescription: {
                      ...prev.structured_jobdescription,
                      application_process: {
                        ...prev.structured_jobdescription.application_process,
                        contact_person: e.target.value
                      }
                    }
                  }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              ) : (
                <p>{structured.application_process.contact_person}</p>
              )}
            </div>
              <div>
              <h3 className="text-lg font-medium mb-2">Kontaktdaten</h3>
              {isEditing ? (
                <input
                  type="text"
                  value={structured.application_process.contact_details}
                  onChange={(e) => setEditedData(prev => ({
                    ...prev,
                    structured_jobdescription: {
                      ...prev.structured_jobdescription,
                      application_process: {
                        ...prev.structured_jobdescription.application_process,
                        contact_details: e.target.value
                      }
                    }
                  }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              ) : (
                <p>{structured.application_process.contact_details}</p>
                )}
              </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Bewerbungsschritte</h3>
              {isEditing ? (
                <textarea
                  value={structured.application_process.steps_to_apply}
                  onChange={(e) => setEditedData(prev => ({
                    ...prev,
                    structured_jobdescription: {
                      ...prev.structured_jobdescription,
                      application_process: {
                        ...prev.structured_jobdescription.application_process,
                        steps_to_apply: e.target.value
                      }
                    }
                  }))}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              ) : (
                <p>{structured.application_process.steps_to_apply}</p>
              )}
            </div>
          </div>
          </section>

        {/* Zusätzliche Informationen */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Zusätzliche Informationen</h2>
          {isEditing ? (
            <textarea
              value={structured.additional_information}
              onChange={(e) => setEditedData(prev => ({
                ...prev,
                structured_jobdescription: {
                  ...prev.structured_jobdescription,
                  additional_information: e.target.value
                }
              }))}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          ) : (
            <p>{structured.additional_information}</p>
        )}
        </section>
      </div>
    );
  };

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">Lade Stellenausschreibung...</div>
        </div>
      </main>
    );
  }

  if (!jobDescription) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">Stellenausschreibung nicht gefunden</div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <PageHeader 
          title={isEditing ? "Stellenausschreibung bearbeiten" : jobDescription?.title}
          subtitle={`Zuletzt aktualisiert am ${new Date(jobDescription?.updatedAt || '').toLocaleDateString()}`}
        />

        <div className="mt-8">
          <div className="flex justify-end mb-4">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
              >
                Bearbeiten
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setEditedData({
                      title: jobDescription?.title || '',
                      content: jobDescription?.content || '',
                      rawText: jobDescription?.rawText || '',
                      language: jobDescription?.language || '',
                      structured_jobdescription: jobDescription?.structured_jobdescription || {
                        job_title: '',
                        company: '',
                        location: '',
                        remote_option: '',
                        salary_range: '',
                        job_overview: '',
                        responsibilities: [],
                        skills: {
                          hard_skills: [],
                          soft_skills: []
                        },
                        benefits: [],
                        application_process: {
                          contact_person: '',
                          contact_details: '',
                          steps_to_apply: ''
                        },
                        additional_information: ''
                      }
                    });
                    setIsEditing(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
                >
                  Speichern
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Basis-Informationen */}
            <section className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Basis-Informationen</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Titel
                </label>
                <input
                  type="text"
                  id="title"
                    value={isEditing ? editedData.title : jobDescription?.title}
                  onChange={(e) => setEditedData(prev => ({ ...prev, title: e.target.value }))}
                    disabled={!isEditing}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                    Sprache
                  </label>
                  <input
                    type="text"
                    id="language"
                    value={isEditing ? editedData.language : jobDescription?.language}
                    onChange={(e) => setEditedData(prev => ({ ...prev, language: e.target.value }))}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            </section>

            {/* Strukturierte Informationen */}
            <section className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Strukturierte Informationen</h2>
              <div className="space-y-6">
                {/* Job Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                    <label htmlFor="job_title" className="block text-sm font-medium text-gray-700">
                      Stellentitel
                    </label>
                    <input
                      type="text"
                      id="job_title"
                      value={isEditing ? editedData.structured_jobdescription.job_title : jobDescription?.structured_jobdescription?.job_title}
                      onChange={(e) => setEditedData(prev => ({
                        ...prev,
                        structured_jobdescription: {
                          ...prev.structured_jobdescription,
                          job_title: e.target.value
                        }
                      }))}
                      disabled={!isEditing}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                      Unternehmen
                    </label>
                    <input
                      type="text"
                      id="company"
                      value={isEditing ? editedData.structured_jobdescription.company : jobDescription?.structured_jobdescription?.company}
                      onChange={(e) => setEditedData(prev => ({
                        ...prev,
                        structured_jobdescription: {
                          ...prev.structured_jobdescription,
                          company: e.target.value
                        }
                      }))}
                      disabled={!isEditing}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                      Standort
                    </label>
                    <input
                      type="text"
                      id="location"
                      value={isEditing ? editedData.structured_jobdescription.location : jobDescription?.structured_jobdescription?.location}
                      onChange={(e) => setEditedData(prev => ({
                        ...prev,
                        structured_jobdescription: {
                          ...prev.structured_jobdescription,
                          location: e.target.value
                        }
                      }))}
                      disabled={!isEditing}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="remote_option" className="block text-sm font-medium text-gray-700">
                      Remote Option
                    </label>
                    <input
                      type="text"
                      id="remote_option"
                      value={isEditing ? editedData.structured_jobdescription.remote_option : jobDescription?.structured_jobdescription?.remote_option}
                      onChange={(e) => setEditedData(prev => ({
                        ...prev,
                        structured_jobdescription: {
                          ...prev.structured_jobdescription,
                          remote_option: e.target.value
                        }
                      }))}
                      disabled={!isEditing}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="salary_range" className="block text-sm font-medium text-gray-700">
                      Gehaltsspanne
                    </label>
                    <input
                      type="text"
                      id="salary_range"
                      value={isEditing ? editedData.structured_jobdescription.salary_range : jobDescription?.structured_jobdescription?.salary_range}
                      onChange={(e) => setEditedData(prev => ({
                        ...prev,
                        structured_jobdescription: {
                          ...prev.structured_jobdescription,
                          salary_range: e.target.value
                        }
                      }))}
                      disabled={!isEditing}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                {/* Job Overview */}
                <div>
                  <label htmlFor="job_overview" className="block text-sm font-medium text-gray-700">
                    Stellenbeschreibung
                </label>
                <textarea
                    id="job_overview"
                    rows={4}
                    value={isEditing ? editedData.structured_jobdescription.job_overview : jobDescription?.structured_jobdescription?.job_overview}
                    onChange={(e) => setEditedData(prev => ({
                      ...prev,
                      structured_jobdescription: {
                        ...prev.structured_jobdescription,
                        job_overview: e.target.value
                      }
                    }))}
                    disabled={!isEditing}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

                {/* Responsibilities */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verantwortlichkeiten
                  </label>
                  {isEditing ? (
                    <div className="space-y-2">
                      {editedData.structured_jobdescription.responsibilities.map((resp, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={resp}
                            onChange={(e) => {
                              const newResponsibilities = [...editedData.structured_jobdescription.responsibilities];
                              newResponsibilities[index] = e.target.value;
                              setEditedData(prev => ({
                                ...prev,
                                structured_jobdescription: {
                                  ...prev.structured_jobdescription,
                                  responsibilities: newResponsibilities
                                }
                              }));
                            }}
                            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                <button
                  onClick={() => {
                              const newResponsibilities = editedData.structured_jobdescription.responsibilities.filter((_, i) => i !== index);
                              setEditedData(prev => ({
                                ...prev,
                                structured_jobdescription: {
                                  ...prev.structured_jobdescription,
                                  responsibilities: newResponsibilities
                                }
                              }));
                            }}
                            className="px-2 py-1 text-sm text-red-600 hover:text-red-800"
                          >
                            Entfernen
                </button>
                        </div>
                      ))}
                <button
                        onClick={() => {
                          setEditedData(prev => ({
                            ...prev,
                            structured_jobdescription: {
                              ...prev.structured_jobdescription,
                              responsibilities: [...prev.structured_jobdescription.responsibilities, '']
                            }
                          }));
                        }}
                        className="mt-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
                      >
                        Verantwortlichkeit hinzufügen
                </button>
            </div>
          ) : (
                    <ul className="list-disc pl-5 space-y-1">
                      {jobDescription?.structured_jobdescription?.responsibilities.map((resp, index) => (
                        <li key={index}>{resp}</li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Skills */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Hard Skills */}
            <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hard Skills
                    </label>
                    {isEditing ? (
                      <div className="space-y-2">
                        {editedData.structured_jobdescription.skills.hard_skills.map((skill, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={skill.skill}
                              onChange={(e) => {
                                const newSkills = [...editedData.structured_jobdescription.skills.hard_skills];
                                newSkills[index] = { ...skill, skill: e.target.value };
                                setEditedData(prev => ({
                                  ...prev,
                                  structured_jobdescription: {
                                    ...prev.structured_jobdescription,
                                    skills: {
                                      ...prev.structured_jobdescription.skills,
                                      hard_skills: newSkills
                                    }
                                  }
                                }));
                              }}
                              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                            <select
                              value={skill.importance_level}
                              onChange={(e) => {
                                const newSkills = [...editedData.structured_jobdescription.skills.hard_skills];
                                newSkills[index] = { ...skill, importance_level: e.target.value };
                                setEditedData(prev => ({
                                  ...prev,
                                  structured_jobdescription: {
                                    ...prev.structured_jobdescription,
                                    skills: {
                                      ...prev.structured_jobdescription.skills,
                                      hard_skills: newSkills
                                    }
                                  }
                                }));
                              }}
                              className="w-32 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            >
                              <option value="must_have">Pflicht</option>
                              <option value="recommended">Empfohlen</option>
                            </select>
                <button
                              onClick={() => {
                                const newSkills = editedData.structured_jobdescription.skills.hard_skills.filter((_, i) => i !== index);
                                setEditedData(prev => ({
                                  ...prev,
                                  structured_jobdescription: {
                                    ...prev.structured_jobdescription,
                                    skills: {
                                      ...prev.structured_jobdescription.skills,
                                      hard_skills: newSkills
                                    }
                                  }
                                }));
                              }}
                              className="px-2 py-1 text-sm text-red-600 hover:text-red-800"
                            >
                              Entfernen
                </button>
              </div>
                        ))}
                        <button
                          onClick={() => {
                            setEditedData(prev => ({
                              ...prev,
                              structured_jobdescription: {
                                ...prev.structured_jobdescription,
                                skills: {
                                  ...prev.structured_jobdescription.skills,
                                  hard_skills: [...prev.structured_jobdescription.skills.hard_skills, { skill: '', importance_level: 'recommended' }]
                                }
                              }
                            }));
                          }}
                          className="mt-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
                        >
                          Hard Skill hinzufügen
                        </button>
                      </div>
                    ) : (
                      <ul className="list-disc pl-5 space-y-1">
                        {jobDescription?.structured_jobdescription?.skills.hard_skills.map((skill, index) => (
                          <li key={index} className={skill.importance_level === 'must_have' ? 'font-medium' : ''}>
                            {skill.skill} {skill.importance_level === 'must_have' && '(Pflicht)'}
                          </li>
                        ))}
                      </ul>
                    )}
                </div>

                  {/* Soft Skills */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Soft Skills
                    </label>
                    {isEditing ? (
                      <div className="space-y-2">
                        {editedData.structured_jobdescription.skills.soft_skills.map((skill, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={skill.skill}
                              onChange={(e) => {
                                const newSkills = [...editedData.structured_jobdescription.skills.soft_skills];
                                newSkills[index] = { ...skill, skill: e.target.value };
                                setEditedData(prev => ({
                                  ...prev,
                                  structured_jobdescription: {
                                    ...prev.structured_jobdescription,
                                    skills: {
                                      ...prev.structured_jobdescription.skills,
                                      soft_skills: newSkills
                                    }
                                  }
                                }));
                              }}
                              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                            <select
                              value={skill.importance_level}
                              onChange={(e) => {
                                const newSkills = [...editedData.structured_jobdescription.skills.soft_skills];
                                newSkills[index] = { ...skill, importance_level: e.target.value };
                                setEditedData(prev => ({
                                  ...prev,
                                  structured_jobdescription: {
                                    ...prev.structured_jobdescription,
                                    skills: {
                                      ...prev.structured_jobdescription.skills,
                                      soft_skills: newSkills
                                    }
                                  }
                                }));
                              }}
                              className="w-32 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            >
                              <option value="must_have">Pflicht</option>
                              <option value="recommended">Empfohlen</option>
                            </select>
                            <button
                              onClick={() => {
                                const newSkills = editedData.structured_jobdescription.skills.soft_skills.filter((_, i) => i !== index);
                                setEditedData(prev => ({
                                  ...prev,
                                  structured_jobdescription: {
                                    ...prev.structured_jobdescription,
                                    skills: {
                                      ...prev.structured_jobdescription.skills,
                                      soft_skills: newSkills
                                    }
                                  }
                                }));
                              }}
                              className="px-2 py-1 text-sm text-red-600 hover:text-red-800"
                            >
                              Entfernen
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            setEditedData(prev => ({
                              ...prev,
                              structured_jobdescription: {
                                ...prev.structured_jobdescription,
                                skills: {
                                  ...prev.structured_jobdescription.skills,
                                  soft_skills: [...prev.structured_jobdescription.skills.soft_skills, { skill: '', importance_level: 'recommended' }]
                                }
                              }
                            }));
                          }}
                          className="mt-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
                        >
                          Soft Skill hinzufügen
                        </button>
                      </div>
                    ) : (
                      <ul className="list-disc pl-5 space-y-1">
                        {jobDescription?.structured_jobdescription?.skills.soft_skills.map((skill, index) => (
                          <li key={index} className={skill.importance_level === 'must_have' ? 'font-medium' : ''}>
                            {skill.skill} {skill.importance_level === 'must_have' && '(Pflicht)'}
                          </li>
                        ))}
                      </ul>
              )}
            </div>
                </div>

                {/* Benefits */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Benefits
                  </label>
                  {isEditing ? (
                    <div className="space-y-2">
                      {editedData.structured_jobdescription.benefits.map((benefit, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={benefit}
                            onChange={(e) => {
                              const newBenefits = [...editedData.structured_jobdescription.benefits];
                              newBenefits[index] = e.target.value;
                              setEditedData(prev => ({
                                ...prev,
                                structured_jobdescription: {
                                  ...prev.structured_jobdescription,
                                  benefits: newBenefits
                                }
                              }));
                            }}
                            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                          <button
                            onClick={() => {
                              const newBenefits = editedData.structured_jobdescription.benefits.filter((_, i) => i !== index);
                              setEditedData(prev => ({
                                ...prev,
                                structured_jobdescription: {
                                  ...prev.structured_jobdescription,
                                  benefits: newBenefits
                                }
                              }));
                            }}
                            className="px-2 py-1 text-sm text-red-600 hover:text-red-800"
                          >
                            Entfernen
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          setEditedData(prev => ({
                            ...prev,
                            structured_jobdescription: {
                              ...prev.structured_jobdescription,
                              benefits: [...prev.structured_jobdescription.benefits, '']
                            }
                          }));
                        }}
                        className="mt-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
                      >
                        Benefit hinzufügen
                      </button>
                    </div>
                  ) : (
                    <ul className="list-disc pl-5 space-y-1">
                      {jobDescription?.structured_jobdescription?.benefits.map((benefit, index) => (
                        <li key={index}>{benefit}</li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Application Process */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Bewerbungsprozess</h3>
                  <div>
                    <label htmlFor="contact_person" className="block text-sm font-medium text-gray-700">
                      Ansprechpartner
                    </label>
                    <input
                      type="text"
                      id="contact_person"
                      value={isEditing ? editedData.structured_jobdescription.application_process.contact_person : jobDescription?.structured_jobdescription?.application_process.contact_person}
                      onChange={(e) => setEditedData(prev => ({
                        ...prev,
                        structured_jobdescription: {
                          ...prev.structured_jobdescription,
                          application_process: {
                            ...prev.structured_jobdescription.application_process,
                            contact_person: e.target.value
                          }
                        }
                      }))}
                      disabled={!isEditing}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact_details" className="block text-sm font-medium text-gray-700">
                      Kontaktdaten
                    </label>
                    <input
                      type="text"
                      id="contact_details"
                      value={isEditing ? editedData.structured_jobdescription.application_process.contact_details : jobDescription?.structured_jobdescription?.application_process.contact_details}
                      onChange={(e) => setEditedData(prev => ({
                        ...prev,
                        structured_jobdescription: {
                          ...prev.structured_jobdescription,
                          application_process: {
                            ...prev.structured_jobdescription.application_process,
                            contact_details: e.target.value
                          }
                        }
                      }))}
                      disabled={!isEditing}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="steps_to_apply" className="block text-sm font-medium text-gray-700">
                      Bewerbungsschritte
                    </label>
                    <textarea
                      id="steps_to_apply"
                      rows={4}
                      value={isEditing ? editedData.structured_jobdescription.application_process.steps_to_apply : jobDescription?.structured_jobdescription?.application_process.steps_to_apply}
                      onChange={(e) => setEditedData(prev => ({
                        ...prev,
                        structured_jobdescription: {
                          ...prev.structured_jobdescription,
                          application_process: {
                            ...prev.structured_jobdescription.application_process,
                            steps_to_apply: e.target.value
                          }
                        }
                      }))}
                      disabled={!isEditing}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                {/* Additional Information */}
                <div>
                  <label htmlFor="additional_information" className="block text-sm font-medium text-gray-700">
                    Zusätzliche Informationen
                  </label>
                  <textarea
                    id="additional_information"
                    rows={4}
                    value={isEditing ? editedData.structured_jobdescription.additional_information : jobDescription?.structured_jobdescription?.additional_information}
                    onChange={(e) => setEditedData(prev => ({
                      ...prev,
                      structured_jobdescription: {
                        ...prev.structured_jobdescription,
                        additional_information: e.target.value
                      }
                    }))}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            </section>

            {/* Raw Text */}
            <section className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Roher Text</h2>
              <textarea
                id="rawText"
                rows={10}
                value={isEditing ? editedData.rawText : jobDescription?.rawText}
                onChange={(e) => setEditedData(prev => ({ ...prev, rawText: e.target.value }))}
                disabled={!isEditing}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </section>
          </div>
        </div>
      </div>
    </main>
  );
} 