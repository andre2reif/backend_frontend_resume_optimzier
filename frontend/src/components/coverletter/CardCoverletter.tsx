'use client';

import { useState, useEffect } from 'react';
import { CoverLetter } from '@/types/api';
import { DeleteButton } from '@/components/common/DeleteButton';
import { useDeleteStore } from '@/lib/stores/deleteStore';
import { motion } from 'framer-motion';
import { fadeInBlur, scaleIn } from '@/lib/animations/animation-variants';
import { ModalEditCoverletter } from './ModalEditCoverletter';

interface CardCoverletterProps {
  coverletter: CoverLetter;
  onDelete: (id: string) => Promise<void>;
}

export default function CardCoverletter({ coverletter, onDelete }: CardCoverletterProps) {
  const { isDeleting } = useDeleteStore();
  const [isVisible, setIsVisible] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [localCoverletter, setLocalCoverletter] = useState(coverletter);

  // Status-spezifische Styles
  const getStatusStyles = () => {
    switch (localCoverletter.status) {
      case 'unstructured':
        return {
          bgColor: 'bg-gray-200',
          textColor: 'text-gray-600',
          label: 'UNSTRUCTURED'
        };
      case 'structured_complete':
        return {
          bgColor: 'bg-orange-500',
          textColor: 'text-white',
          label: 'STRUCTURED'
        };
      case 'optimized':
        return {
          bgColor: 'bg-green-500',
          textColor: 'text-white',
          label: 'OPTIMIZED'
        };
      default:
        return {
          bgColor: 'bg-gray-200',
          textColor: 'text-gray-600',
          label: 'UNKNOWN'
        };
    }
  };

  const statusStyles = getStatusStyles();
  const formattedDate = new Date(localCoverletter.createdAt).toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Aktualisiere die Sichtbarkeit basierend auf dem Store-Status
  useEffect(() => {
    const shouldHide = isDeleting(coverletter._id);
    setIsVisible(!shouldHide);
  }, [isDeleting, coverletter._id]);

  const cardClasses = `
    bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300
    ${!isVisible ? 'opacity-0 pointer-events-none' : 'opacity-100'}
  `;

  const coverletterId = coverletter._id || coverletter.id;

  const handleSave = (updatedCoverletter: CoverLetter) => {
    setLocalCoverletter(updatedCoverletter);
  };

  return (
    <>
      <motion.div
        className={cardClasses}
        variants={fadeInBlur}
        initial="initial"
        animate={isVisible ? "animate" : "exit"}
        exit="exit"
      >
        <motion.div 
          className="p-4"
          variants={scaleIn}
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-lg font-semibold">
                  {localCoverletter.title}
                </span>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles.bgColor} ${statusStyles.textColor}`}>
                    {statusStyles.label}
                  </span>
                  <span className="text-sm text-gray-500">
                    {formattedDate}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="btn btn-ghost btn-sm"
                  disabled={!isVisible}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                <DeleteButton
                  id={coverletterId}
                  title={localCoverletter.title}
                  onDelete={onDelete}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <ModalEditCoverletter
        coverletterId={coverletterId}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSave}
      />
    </>
  );
} 