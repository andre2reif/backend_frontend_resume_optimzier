'use client';

import FileUpload from '@/components/upload/FileUpload';

interface ModalFileUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (content: string, filename: string) => Promise<void>;
  disabled?: boolean;
}

export function ModalFileUpload({
  isOpen,
  onClose,
  onUpload,
  disabled
}: ModalFileUploadProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
        
        <div className="relative transform overflow-hidden rounded-lg bg-base-100 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={onClose}
          >
            ✕
          </button>

          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 className="text-lg font-semibold leading-6 text-base-content mb-4">
                Anschreiben hochladen
              </h3>
              <p className="text-sm text-base-content/70 mb-6">
                Lade dein Anschreiben als PDF, DOC oder DOCX hoch. Die Datei wird automatisch strukturiert und für die weitere Bearbeitung vorbereitet.
              </p>
              <FileUpload
                onUpload={onUpload}
                disabled={disabled}
                accept=".pdf,.doc,.docx"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 