'use client';

import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import FileUpload from '@/components/upload/FileUpload';

interface UploadResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (content: string, filename: string) => void;
  isUploading: boolean;
}

export default function UploadResumeModal({ isOpen, onClose, onUpload, isUploading }: UploadResumeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
          onClick={onClose} 
        />
        
        {/* Modal */}
        <div className="relative w-full max-w-2xl rounded-lg bg-base-100 p-6 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-medium">Lebenslauf hochladen</h3>
            <button 
              onClick={onClose} 
              className="btn btn-ghost btn-sm btn-circle"
              disabled={isUploading}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4">
            <FileUpload 
              onUpload={onUpload} 
              disabled={isUploading} 
            />
          </div>
        </div>
      </div>
    </div>
  );
} 