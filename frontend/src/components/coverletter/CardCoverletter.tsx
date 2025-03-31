'use client';

import { useState, useEffect } from 'react';
import { CoverLetter } from '@/types/api';
import toast from 'react-hot-toast';

interface CardCoverLetterProps {
  coverLetter: CoverLetter;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onStartDelete: (id: string) => void;
  onCancelDelete: (id: string) => void;
  processingCoverletters: Set<string>;
  deletingCoverletters: Set<string>;
}

function truncateTitle(title: string, maxLength: number = 20): string {
  if (title.length <= maxLength) return title;
  return `${title.substring(0, maxLength)}...`;
}

export function CardCoverLetter(props: CardCoverLetterProps) {
  const {
    coverLetter,
    onEdit,
    onDelete,
    onStartDelete,
    onCancelDelete,
    processingCoverletters,
    deletingCoverletters
  } = props;

  const [isDeleting, setIsDeleting] = useState(false);
  const [toastId, setToastId] = useState<string | undefined>(undefined);

  const coverletterId = coverLetter._id || coverLetter.id;
  const isProcessing = processingCoverletters.has(coverletterId);
  const isBeingDeleted = deletingCoverletters.has(coverletterId);
  const canEdit = coverLetter.status === 'structured_complete';

  const handleDelete = () => {
    if (!coverletterId) {
      toast.error('Anschreiben wurde bereits gelöscht');
      return;
    }

    setIsDeleting(true);
    onStartDelete(coverletterId);

    const newToastId = toast.loading(
      <div className="flex items-center gap-2 max-w-[300px]">
        <span className="truncate">"{truncateTitle(coverLetter.title)}" wird gelöscht...</span>
        <button
          className="link link-primary whitespace-nowrap"
          onClick={() => {
            setIsDeleting(false);
            toast.dismiss(newToastId);
            setToastId(undefined);
            onCancelDelete(coverletterId);
          }}
        >
          Rückgängig
        </button>
      </div>,
      {
        position: 'bottom-center',
        duration: 5000,
        className: 'toast-start',
      }
    );

    setToastId(newToastId);
  };

  useEffect(() => {
    let deleteTimer: NodeJS.Timeout;

    if (isDeleting && coverletterId) {
      deleteTimer = setTimeout(() => {
        console.log('5 Sekunden vorbei, nun kann gelöscht werden');
        onDelete(coverletterId);
        if (toastId) {
          toast.dismiss(toastId);
          setToastId(undefined);
        }
      }, 5000);
    }

    return () => {
      if (deleteTimer) {
        clearTimeout(deleteTimer);
      }
    };
  }, [isDeleting, coverletterId, onDelete, toastId]);

  // Wenn das Anschreiben im Löschprozess ist oder bereits gelöscht wurde, zeige nichts an
  if (!coverletterId || isBeingDeleted) {
    return null;
  }

  const getStatusBadgeClass = (status: CoverLetter['status']) => {
    switch (status) {
      case 'structured_complete':
        return 'badge-success';
      case 'optimized':
        return 'badge-info';
      case 'unstructured':
        return 'badge-warning';
      default:
        return 'badge-ghost';
    }
  };

  const getStatusText = (status: CoverLetter['status']) => {
    switch (status) {
      case 'structured_complete':
        return 'Strukturiert';
      case 'optimized':
        return 'Optimiert';
      case 'unstructured':
        return 'Unstrukturiert';
      default:
        return 'Entwurf';
    }
  };

  return (
    <div className={`card bg-base-100 shadow-xl transition-opacity duration-200 ${isProcessing ? 'opacity-50' : 'opacity-100'}`}>
      <div className="card-body">
        <div className="flex items-start justify-between">
          <h2 className="card-title text-lg font-bold truncate" title={coverLetter.title}>
            {truncateTitle(coverLetter.title)}
          </h2>
          <div className={`badge ${getStatusBadgeClass(coverLetter.status)}`}>
            {getStatusText(coverLetter.status)}
          </div>
        </div>

        <p className="mt-2 text-sm text-gray-600">
          {coverLetter.rawText ? coverLetter.rawText.substring(0, 150) + '...' : 'Kein Inhalt verfügbar'}
        </p>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <span>Erstellt am {new Date(coverLetter.createdAt).toLocaleDateString()}</span>
          <span>Aktualisiert am {new Date(coverLetter.updatedAt).toLocaleDateString()}</span>
        </div>

        <div className="card-actions mt-4 justify-end">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => onEdit(coverletterId)}
            disabled={!canEdit || isProcessing || isDeleting}
          >
            {canEdit ? 'Bearbeiten' : 'Wird vorbereitet...'}
          </button>
          <button
            className="btn btn-error btn-sm"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
} 