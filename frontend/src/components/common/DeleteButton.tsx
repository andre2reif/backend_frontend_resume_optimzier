'use client';

import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useDeleteStore } from '@/lib/stores/deleteStore';

interface DeleteButtonProps {
  id: string;
  title: string;
  onDelete: (id: string) => Promise<void>;
  disabled?: boolean;
  className?: string;
}

function truncateTitle(title: string, maxLength: number = 20): string {
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
      <div className="flex items-center gap-2 max-w-[400px]  whitespace-nowrap">
        <span className="truncate">"{truncateTitle(title)}" wird gelöscht...</span>
        <button
          className="link text-white hover:text-white/80"
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
        </button>
      </div>,
      {
        position: 'bottom-left',
        duration: 5000,
        className: 'bg-black text-white',
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
      className={`btn btn-error btn-sm ${className}`}
      onClick={handleDelete}
      disabled={isDeleting(id) || disabled}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    </button>
  );
} 