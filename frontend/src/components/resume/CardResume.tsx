'use client';
import { Resume } from '@/types/api';
import { CommonCard } from '@/components/common/CommonCard';

interface CardResumeProps {
  resume: Resume;
  processingResumes: Set<string>;
  deletingResumes: Set<string>;
  onEdit: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
  onStartDelete: (id: string) => void;
  onCancelDelete: (id: string) => void;
}

export default function CardResume({ 
  resume, 
  processingResumes, 
  deletingResumes, 
  onDelete 
}: CardResumeProps) {
  const resumeId = resume._id || resume.id;
  if (!resumeId) return null;
  
  return (
    <CommonCard
      id={resumeId}
      title={resume.title || 'Unbenannter Lebenslauf'}
      createdAt={resume.createdAt || new Date().toISOString()}
      isStructured={resume.status === 'structured_complete'}
      linkPath={`/resume/${resumeId}`}
      onDelete={onDelete}
      isProcessing={processingResumes.has(resumeId)}
      isDeleting={deletingResumes.has(resumeId)}
    />
  );
} 