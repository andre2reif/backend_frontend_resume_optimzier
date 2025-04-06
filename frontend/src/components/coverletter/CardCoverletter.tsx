'use client';

import { CoverLetter } from '@/types/api';
import { CommonCard } from '@/components/common/CommonCard';

interface CardCoverletterProps {
  coverletter: CoverLetter;
  processingCoverletters: Set<string>;
  deletingCoverletters: Set<string>;
  onEdit: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
  onStartDelete: (id: string) => void;
  onCancelDelete: (id: string) => void;
}

export default function CardCoverletter({ 
  coverletter, 
  processingCoverletters, 
  deletingCoverletters, 
  onDelete 
}: CardCoverletterProps) {
  const coverletterId = coverletter._id || coverletter.id;
  if (!coverletterId) return null;
  
  return (
    <CommonCard
      id={coverletterId}
      title={coverletter.title || 'Unbenanntes Anschreiben'}
      createdAt={coverletter.createdAt || new Date().toISOString()}
      isStructured={coverletter.status === 'structured_complete'}
      linkPath={`/coverletter/${coverletterId}`}
      onDelete={onDelete}
      isProcessing={processingCoverletters.has(coverletterId)}
      isDeleting={deletingCoverletters.has(coverletterId)}
    />
  );
} 