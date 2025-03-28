'use client';

import { useState } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ResumePDF from './ResumePDF';
import { Resume } from '@/types/api';

interface PDFDownloadButtonProps {
  resume: Resume;
  className?: string;
}

export default function PDFDownloadButton({ resume, className }: PDFDownloadButtonProps) {
  const [isClient, setIsClient] = useState(false);

  // PDFDownloadLink muss auf dem Client gerendert werden
  useState(() => {
    setIsClient(true);
  });

  if (!isClient) {
    return (
      <button disabled className={className}>
        PDF wird vorbereitet...
      </button>
    );
  }

  return (
    <PDFDownloadLink
      document={<ResumePDF resume={resume} />}
      fileName={`${resume.title.toLowerCase().replace(/\s+/g, '-')}.pdf`}
      className={className}
    >
      {({ loading }) =>
        loading ? 'PDF wird generiert...' : 'Als PDF herunterladen'
      }
    </PDFDownloadLink>
  );
} 