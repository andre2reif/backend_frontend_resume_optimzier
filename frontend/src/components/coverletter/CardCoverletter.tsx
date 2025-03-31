'use client';

import { useState, useEffect, useRef } from 'react';
import { CoverLetter } from '@/types/api';
import toast from 'react-hot-toast';
import { DeleteButton } from '@/components/common/DeleteButton';

interface CardCoverLetterProps {
  coverLetter: CoverLetter;
  onEdit: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
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

  const coverletterId = coverLetter._id || coverLetter.id;
  const isProcessing = processingCoverletters.has(coverletterId);
  const isBeingDeleted = deletingCoverletters.has(coverletterId);
  const canEdit = coverLetter.status === 'structured_complete';

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
            disabled={!canEdit || isProcessing}
          >
            {canEdit ? 'Bearbeiten' : 'Wird vorbereitet...'}
          </button>
          <DeleteButton
            id={coverletterId}
            title={coverLetter.title}
            onDelete={onDelete}
            onStartDelete={onStartDelete}
            onCancelDelete={onCancelDelete}
            isDeleting={isBeingDeleted}
          />
        </div>
      </div>
    </div>
  );
} 