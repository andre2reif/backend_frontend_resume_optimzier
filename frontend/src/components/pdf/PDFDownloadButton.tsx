'use client';

import { useState } from 'react';
import { PDFDownloadLink, BlobProvider } from '@react-pdf/renderer';
import ResumePDF from '@/components/pdf/ResumePDF';
import { Resume } from '@/types/api';

interface PDFDownloadButtonProps {
  resume: Resume;
  className?: string;
}

interface BlobProviderRenderProps {
  blob: Blob | null;
  url: string | null;
  loading: boolean;
  error: Error | null;
}

export default function PDFDownloadButton({ resume, className = '' }: PDFDownloadButtonProps) {
  if (!resume) {
    console.error('PDFDownloadButton: Resume ist undefined');
    return null;
  }

  const fileName = resume.title 
    ? `${resume.title.toLowerCase().replace(/\s+/g, '-')}.pdf`
    : 'lebenslauf.pdf';

  return (
    <PDFDownloadLink
      document={<ResumePDF resume={resume} />}
      fileName={fileName}
      className={className}
    >
      {({ loading }: BlobProviderRenderProps) => (
        <button 
          className="btn btn-primary btn-sm" 
          disabled={loading}
        >
          {loading ? 'Wird erstellt...' : 'PDF herunterladen'}
        </button>
      )}
    </PDFDownloadLink>
  );
} 