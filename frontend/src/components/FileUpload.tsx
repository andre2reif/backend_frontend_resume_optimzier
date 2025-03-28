'use client';

import { useState, useRef, useCallback } from 'react';
import { extractTextFromFile, isValidFileType } from '@/lib/file-utils';
import toast from 'react-hot-toast';

interface FileUploadProps {
  onUpload: (content: string, filename: string) => void;
  disabled?: boolean;
  accept?: string;
  maxSize?: number; // in MB
}

export default function FileUpload({ onUpload, disabled = false, accept = '.pdf,.doc,.docx', maxSize = 5 }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (!isValidFileType(file.name)) {
      toast.error('Ungültiges Dateiformat. Bitte laden Sie eine PDF- oder Word-Datei hoch.');
      return;
    }

    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`Die Datei ist zu groß. Maximale Größe: ${maxSize}MB`);
      return;
    }

    setIsUploading(true);

    try {
      const content = await extractTextFromFile(file);

      if (!content || content.trim() === '') {
        throw new Error('Keine Textinhalte gefunden');
      }

      onUpload(content, file.name);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Fehler beim Hochladen der Datei');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (!file) return;
    await processFile(file);
  }, []);

  return (
    <div 
      className={`flex justify-center rounded-lg border-2 border-dashed transition-colors duration-200 ${
        isDragging ? 'border-primary bg-primary/5' : 'border-base-content/25'
      } px-6 py-10`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="text-center">
        <div className="mt-4 flex text-sm leading-6 text-base-content/80">
          <label
            htmlFor="file-upload"
            className={`relative cursor-pointer rounded-md font-semibold text-primary hover:text-primary/80 ${
              disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <span>Datei hochladen</span>
            <input
              id="file-upload"
              name="file-upload"
              type="file"
              className="sr-only"
              onChange={handleFileChange}
              accept={accept}
              disabled={disabled}
            />
          </label>
          <p className="pl-1">oder per Drag & Drop</p>
        </div>
        <p className="text-xs leading-5 text-base-content/60">
          PDF, DOC oder DOCX bis zu {maxSize}MB
        </p>
        {isUploading && (
          <div className="mt-4">
            <div className="loading loading-spinner loading-sm"></div>
            <p className="text-sm text-base-content/60 mt-2">Wird verarbeitet...</p>
          </div>
        )}
      </div>
    </div>
  );
} 