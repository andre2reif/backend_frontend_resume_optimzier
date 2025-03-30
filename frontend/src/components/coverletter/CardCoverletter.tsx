'use client';

import { useState } from 'react';
import { CoverLetter } from '@/types/api';

import { showErrorToast } from '@/lib/toast/utils';

interface CardCoverLetterProps {
  coverLetter: CoverLetter;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onStartDelete: (id: string) => void;
  onCancelDelete: (id: string) => void;
  processingCoverletters: Set<string>;
  deletingCoverletters: Set<string>;
}

function formatDate(dateString: string | Date): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Ungültiges Datum';
    return format(date, 'dd.MM.yyyy HH:mm', { locale: de });
  } catch (error) {
    console.error('Fehler bei der Datumsformatierung:', error);
    return 'Ungültiges Datum';
  }
}

export function CardCoverLetter({
  coverLetter,
  onEdit,
  onDelete,
  onStartDelete,
  onCancelDelete,
  processingCoverletters,
  deletingCoverletters
}: CardCoverLetterProps) {
  const isProcessing = processingCoverletters.has(coverLetter.id);
  const isDeleting = deletingCoverletters.has(coverLetter.id);

  const getStatusBadgeClass = (status: CoverLetter['status']) => {
    switch (status) {
      case 'structured_complete':
        return 'badge-success';
      case 'optimized':
        return 'badge-primary';
      default:
        return 'badge-warning';
    }
  };

  const getStatusText = (status: CoverLetter['status']) => {
    switch (status) {
      case 'structured_complete':
        return 'Strukturiert';
      case 'optimized':
        return 'Optimiert';
      default:
        return 'Entwurf';
    }
  };

  return (
    <div className={`card bg-base-100 shadow-xl transition-opacity duration-200 ${isProcessing ? 'opacity-50' : 'opacity-100'}`}>
      <div className="card-body">
        <div className="flex items-start justify-between">
          <h2 className="card-title text-lg font-bold">{coverLetter.title}</h2>
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
            onClick={() => onEdit(coverLetter.id)}
            disabled={isProcessing || isDeleting}
          >
            Bearbeiten
          </button>
          {isDeleting ? (
            <div className="space-x-2">
              <button
                className="btn btn-error btn-sm"
                onClick={() => onDelete(coverLetter.id)}
              >
                Wirklich löschen?
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => onCancelDelete(coverLetter.id)}
              >
                Abbrechen
              </button>
            </div>
          ) : (
            <button
              className="btn btn-error btn-sm"
              onClick={() => onStartDelete(coverLetter.id)}
              disabled={isProcessing}
            >
              Löschen
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 