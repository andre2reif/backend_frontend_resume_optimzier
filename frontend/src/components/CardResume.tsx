'use client';

import { Resume } from '@/types/api';
import { DeleteButton } from '@/components/common/DeleteButton';

interface CardResumeProps {
  resume: Resume;
  processingResumes: Set<string>;
  deletingResumes: Set<string>;
  onEdit: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
  onStartDelete: (id: string) => void;
  onCancelDelete: (id: string) => void;
}

function truncateTitle(title: string, maxLength: number = 20): string {
  if (title.length <= maxLength) return title;
  return `${title.substring(0, maxLength)}...`;
}

export default function CardResume({ resume, processingResumes, deletingResumes, onEdit, onDelete, onStartDelete, onCancelDelete }: CardResumeProps) {
  const resumeId = resume._id || resume.id;
  if (!resumeId || deletingResumes.has(resumeId)) {
    return null;
  }

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title truncate" title={resume.title}>
          {truncateTitle(resume.title)}
        </h2>
        <p className="text-sm text-gray-500">
          Erstellt am {resume.createdAt ? new Date(resume.createdAt).toLocaleDateString('de-DE') : 'Datum nicht verfügbar'}
        </p>
        <div className="space-y-2">
          {resume.status === 'unstructured' ? (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-warning">Wird strukturiert...</span>
                <div className="loading loading-spinner loading-sm"></div>
              </div>
              <progress className="progress progress-warning w-full"></progress>
            </div>
          ) : resume.status === 'structured_complete' ? (
            <p className="text-sm text-success flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Strukturiert
            </p>
          ) : (
            <p className="text-sm text-error flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Fehler bei der Strukturierung
            </p>
          )}
        </div>
        <div className="card-actions justify-end space-x-2">
          {resume.id && processingResumes.has(resume.id) ? (
            <div className="flex items-center space-x-2">
              <div className="loading loading-spinner loading-sm"></div>
              <span className="text-sm text-gray-500">Wird verarbeitet...</span>
            </div>
          ) : (
            <>
              <DeleteButton
                id={resumeId}
                title={resume.title}
                onDelete={onDelete}
                onStartDelete={onStartDelete}
                onCancelDelete={onCancelDelete}
                isDeleting={deletingResumes.has(resumeId)}
              />
              <button
                className="btn btn-primary"
                disabled={resume.status === 'unstructured' || deletingResumes.has(resumeId)}
                onClick={() => onEdit(resumeId)}
              >
                {resume.status === 'unstructured' ? 'Wird vorbereitet...' : 'Bearbeiten'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 