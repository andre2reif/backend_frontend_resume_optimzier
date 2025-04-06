'use client';

import { useState } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import CoverLetterPDF from '@/components/pdf/CoverLetterPDF';
import { CoverLetter } from '@/types/api';

interface CoverLetterPDFDownloadButtonProps {
  coverletter: CoverLetter;
  className?: string;
}

export default function CoverLetterPDFDownloadButton({ coverletter, className = '' }: CoverLetterPDFDownloadButtonProps) {
  if (!coverletter) {
    console.error('CoverLetterPDFDownloadButton: Coverletter ist undefined');
    return null;
  }

  const fileName = coverletter.title 
    ? `${coverletter.title.toLowerCase().replace(/\s+/g, '-')}.pdf`
    : 'anschreiben.pdf';

  return (
    <PDFDownloadLink
      document={<CoverLetterPDF coverletter={coverletter} />}
      fileName={fileName}
      className={className}
    >
      {/* @ts-ignore */}
      {({ loading }) => (
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