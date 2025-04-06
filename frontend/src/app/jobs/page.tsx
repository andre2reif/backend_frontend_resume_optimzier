'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { CommonCard } from '@/components/common/CommonCard';
import { ButtonCreateJobDescription } from '@/components/common/buttons/ButtonCreateJobDescription';
import { PageHeader } from '@/components/common/PageHeader';

interface JobDescription {
  id: string;
  title: string;
  status: string;
  createdAt: string;
}

export default function JobsPage() {
  const { data: session } = useSession();
  const [jobDescriptions, setJobDescriptions] = useState<JobDescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobDescriptions = async () => {
    if (!session?.user?.id) return;
    
    try {
      const response = await fetch(`http://localhost:8000/api/v1/jobdescriptions/view?user_id=${session.user.id}`);
      if (!response.ok) throw new Error('Fehler beim Laden der Stellenausschreibungen');
      
      const data = await response.json();
      setJobDescriptions(data.data);

      // Automatische Strukturierung für unstrukturierte Dokumente
      data.data.forEach(async (job: JobDescription) => {
        if (job.status === 'unstructured') {
          try {
            // Hole zuerst die Details der einzelnen Stellenausschreibung
            const jobResponse = await fetch(
              `http://localhost:8000/api/v1/jobdescriptions/view/${job.id}?user_id=${session.user.id}`
            );
            
            if (!jobResponse.ok) {
              console.error(`Fehler beim Laden der Stellenausschreibung ${job.id}:`, await jobResponse.json());
              return;
            }

            // Starte die Strukturierung
            const structureResponse = await fetch(
              `http://localhost:8000/extract-structured-document?document_id=${job.id}&document_type=jobdescription&language=de&user_id=${session.user.id}`
            );
            
            if (!structureResponse.ok) {
              console.error(`Fehler bei der Strukturierung von Job ${job.id}:`, await structureResponse.json());
            }
          } catch (error) {
            console.error(`Fehler bei der Strukturierung von Job ${job.id}:`, error);
          }
        }
      });

    } catch (error) {
      console.error('Fehler beim Laden der Stellenausschreibungen:', error);
      setError(error instanceof Error ? error.message : 'Ein unerwarteter Fehler ist aufgetreten');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!session?.user?.id) return;
    
    try {
      const response = await fetch(`http://localhost:8000/api/v1/jobdescriptions/delete/${id}?user_id=${session.user.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Fehler beim Löschen der Stellenausschreibung');
      
      setJobDescriptions(prev => prev.filter(job => job.id !== id));
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      setError(error instanceof Error ? error.message : 'Ein unerwarteter Fehler ist aufgetreten');
    }
  };

  useEffect(() => {
    fetchJobDescriptions();
  }, [session]);

  if (isLoading) return <div>Laden...</div>;
  if (error) return <div>Fehler: {error}</div>;

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <PageHeader 
          title="Stellenausschreibungen" 
          subtitle="Verwalte deine Stellenausschreibungen und erstelle daraus passende Anschreiben."
        />

        <div className="mt-6">
          <ButtonCreateJobDescription onSuccess={fetchJobDescriptions} />
        </div>

        <div className="mt-8 grid gap-6">
          {jobDescriptions.map((job) => (
            <CommonCard
              key={job.id}
              id={job.id}
              title={job.title}
              createdAt={job.createdAt}
              isStructured={job.status === 'structured_complete'}
              linkPath={`/jobs/${job.id}`}
              onDelete={handleDelete}
              isProcessing={job.status === 'unstructured'}
            />
          ))}
        </div>
      </div>
    </main>
  );
} 