'use client';

import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useDeleteStore } from '@/lib/stores/deleteStore';
import { motion, AnimatePresence } from 'framer-motion';

interface DeleteButtonProps {
  id: string;
  title: string;
  onDelete: (id: string) => Promise<void>;
  disabled?: boolean;
  className?: string;
}

function truncateTitle(title: string, maxLength: number = 30): string {
  if (title.length <= maxLength) return title;
  return `${title.substring(0, maxLength)}...`;
}

export function DeleteButton({
  id,
  title,
  onDelete,
  disabled = false,
  className = ''
}: DeleteButtonProps) {
  const [toastId, setToastId] = useState<string | undefined>(undefined);
  const deleteTimerRef = useRef<NodeJS.Timeout>();
  const { startDelete, cancelDelete, isDeleting } = useDeleteStore();

  const handleDelete = () => {
    console.log('DeleteButton: Delete button clicked with ID:', id);
    
    // Prüfe, ob eine gültige ID vorhanden ist
    if (!id) {
      console.error('DeleteButton: No ID provided');
      toast.error('Fehler: Keine Dokument-ID gefunden');
      return;
    }

    // Prüfe, ob die ID ein gültiges Format hat (MongoDB ObjectId)
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      console.error('DeleteButton: Invalid ID format:', id);
      toast.error('Fehler: Ungültiges ID-Format');
      return;
    }

    console.log('DeleteButton: Starting delete process for document:', id);
    
    // Starte den Löschvorgang im Store
    startDelete(id);
    
    // Zeige Toast an
    const newToastId = toast.loading(
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-4 py-2"
      >
        <span className="text-base">"{truncateTitle(title)}" wird gelöscht...</span>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="text-blue-300 border-b-2 border-blue-300 hover:text-blue-200 hover:border-blue-200 transition-colors"
          onClick={() => {
            console.log('DeleteButton: Cancel button clicked, cancelling delete process');
            if (deleteTimerRef.current) {
              console.log('DeleteButton: Cleaning up timer');
              clearTimeout(deleteTimerRef.current);
            }
            toast.dismiss(newToastId);
            setToastId(undefined);
            cancelDelete(id);
          }}
        >
          Rückgängig
        </motion.button>
      </motion.div>,
      {
        position: 'bottom-left',
        duration: 5000,
        style: {
          minWidth: '450px',
          backgroundColor: 'black',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '0.5rem',
        }
      }
    );

    setToastId(newToastId);
    console.log('DeleteButton: Toast notification created with ID:', newToastId);

    // Starte den Timer
    console.log('DeleteButton: Setting up delete timer');
    deleteTimerRef.current = setTimeout(() => {
      console.log('DeleteButton: Timer completed, executing delete');
      onDelete(id)
        .then(() => {
          console.log('DeleteButton: Delete operation completed successfully');
          if (toastId) {
            console.log('DeleteButton: Dismissing toast notification');
            toast.dismiss(toastId);
            setToastId(undefined);
          }
          cancelDelete(id);
        })
        .catch((error) => {
          console.error('DeleteButton: Error during delete operation:', error);
          cancelDelete(id);
        });
    }, 5000);
  };

  // Cleanup nur beim Unmount
  useEffect(() => {
    return () => {
      if (deleteTimerRef.current) {
        console.log('DeleteButton: Cleaning up timer on unmount');
        clearTimeout(deleteTimerRef.current);
      }
    };
  }, []);

  return (
    <button
      className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
      onClick={handleDelete}
      disabled={isDeleting(id) || disabled}
    >
      Löschen
    </button>
  );
} 