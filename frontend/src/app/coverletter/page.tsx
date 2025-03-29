'use client';

import { useState, useEffect, useCallback } from 'react';
import LayoutMain from '@/components/layout/LayoutMain';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { API_BASE_URL } from '@/config/api';
import FileUpload from '@/components/FileUpload';
import toast from 'react-hot-toast';

interface CoverLetter {
  id: string;
  title: string;
  company: string;
  createdAt: string;
  status: 'draft' | 'optimized';
  preview: string;
}

export default function CoverLetterPage() {
  const { data: session } = useSession();
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCoverLetters = useCallback(async () => {
    if (!session?.user?.email) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(
        `${API_BASE_URL}/api/v1/coverletters/view?user_id=${encodeURIComponent(session.user.email)}`,
        {
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Fehler beim Laden der Anschreiben');
      }

      const data = await response.json();
      if (data.status === 'success') {
        setCoverLetters(data.data);
      } else {
        throw new Error(data.message || 'Fehler beim Laden der Anschreiben');
      }
    } catch (error) {
      console.error('Error fetching cover letters:', error);
      setError('Fehler beim Laden der Anschreiben');
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.email]);

  useEffect(() => {
    fetchCoverLetters();
  }, [fetchCoverLetters]);

  const handleFileUpload = async (content: string, filename: string) => {
    if (!session?.user?.email) {
      toast.error('Bitte melden Sie sich an');
      return;
    }

    try {
      setIsUploading(true);
      const title = filename.replace(/\.[^/.]+$/, '');
      
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('user_id', session.user.email);

      const response = await fetch(`${API_BASE_URL}/api/v1/coverletters/create`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Fehler beim Erstellen des Anschreibens');
      }

      const data = await response.json();
      if (data.status === 'success') {
        toast.success('Anschreiben erfolgreich erstellt');
        await fetchCoverLetters();
      } else {
        throw new Error(data.message || 'Fehler beim Erstellen des Anschreibens');
      }
    } catch (error) {
      console.error('Error creating cover letter:', error);
      toast.error('Fehler beim Erstellen des Anschreibens');
    } finally {
      setIsUploading(false);
    }
  };

  if (!session) {
    return (
      <LayoutMain>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Bitte melden Sie sich an</h1>
            <Link
              href="/auth/signin"
              className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Anmelden
            </Link>
          </div>
        </div>
      </LayoutMain>
    );
  }

  return (
    <LayoutMain>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Anschreiben</h1>
        </div>

        <div className="bg-gray-100 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Neues Anschreiben hochladen</h2>
          <p className="text-gray-600 mb-4">
            Laden Sie ein bestehendes Anschreiben hoch oder erstellen Sie ein neues.
          </p>
          <FileUpload 
            onUpload={handleFileUpload} 
            isUploading={isUploading}
            acceptedFileTypes="PDF, DOC oder DOCX bis zu 5MB"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : coverLetters.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Keine Anschreiben vorhanden. Laden Sie ein neues Anschreiben hoch.
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Titel
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unternehmen
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Erstellt am
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aktionen
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {coverLetters.map((letter) => (
                    <tr key={letter.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{letter.title}</div>
                        <div className="text-sm text-gray-500">{letter.preview}...</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{letter.company}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          letter.status === 'optimized' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {letter.status === 'optimized' ? 'Optimiert' : 'Entwurf'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{new Date(letter.createdAt).toLocaleDateString('de-DE')}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-4">
                          Bearbeiten
                        </button>
                        <button className="text-purple-600 hover:text-purple-900 mr-4">
                          Optimieren
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          Löschen
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </LayoutMain>
  );
} 