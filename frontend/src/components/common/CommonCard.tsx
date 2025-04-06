'use client';
import Link from 'next/link';
import { DeleteButton } from '@/components/common/DeleteButton';

interface CommonCardProps {
  id: string;
  title: string;
  createdAt: string | Date;
  isStructured?: boolean;
  linkPath: string;
  onDelete: (id: string) => Promise<void>;
  isProcessing?: boolean;
  isDeleting?: boolean;
}

export function CommonCard({
  id,
  title,
  createdAt,
  isStructured = false,
  linkPath,
  onDelete,
  isProcessing = false,
  isDeleting = false,
}: CommonCardProps) {
  if (!id || isDeleting) {
    return null;
  }

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="p-4">
        <div className="flex flex-col min-h-[120px]">
          <div className="flex-grow">
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-base font-normal truncate max-w-[80%]">{title}</h2>
              <DeleteButton
                id={id}
                title={title}
                onDelete={onDelete}
              />
            </div>

            <p className="text-sm text-gray-500">
              Erstellt am {createdAt && !isNaN(new Date(createdAt).getTime()) 
                ? new Date(createdAt).toLocaleDateString() 
                : "gerade eben"}
            </p>

            {!isStructured ? (
              <div className="mt-2 flex items-center gap-1.5">
                <div className="w-4 h-4 animate-spin">
                  <svg className="text-yellow-500" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <span className="text-sm text-yellow-500">Wird strukturiert (bis zu 1 Minute)...</span>
              </div>
            ) : isStructured && (
              <div className="mt-2 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-emerald-500">Strukturiert</span>
              </div>
            )}
          </div>

          <div className="flex justify-end mt-4">
            {isStructured && (
              <Link
                href={linkPath}
                className="px-4 py-1.5 bg-[#1f2937] hover:bg-[#374151] text-white text-sm rounded-md"
              >
                Öffnen
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 