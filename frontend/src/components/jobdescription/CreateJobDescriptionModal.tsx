'use client';

import { useState } from 'react';
import ModalLayout from '../layout/ModalLayout';
import { jobdescriptionApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface CreatejobdescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreatejobdescriptionModal({
  isOpen,
  onClose,
  onSuccess,
}: CreatejobdescriptionModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Bitte füllen Sie alle Felder aus');
      return;
    }

    setIsLoading(true);

    try {
      const response = await jobdescriptionApi.create(formData);
      if (response.status === "success") {
        toast.success('Stellenausschreibung erfolgreich erstellt');
        onSuccess();
        onClose();
        setFormData({ title: '', content: '' });
      } else {
        throw new Error('Fehler beim Erstellen der Stellenausschreibung');
      }
    } catch (error: any) {
      toast.error(error.message || 'Fehler beim Erstellen der Stellenausschreibung');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ModalLayout
      isOpen={isOpen}
      onClose={onClose}
      title="Neue Stellenausschreibung erstellen"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-base-content">
            Titel
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="mt-1 block w-full rounded-md border-base-content/20 bg-base-100 px-3 py-2 text-base-content shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
            placeholder="z.B. Senior Software Engineer"
            required
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-base-content">
            Stellenausschreibung
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={10}
            className="mt-1 block w-full rounded-md border-base-content/20 bg-base-100 px-3 py-2 text-base-content shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
            placeholder="Fügen Sie hier den Text der Stellenausschreibung ein..."
            required
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
          >
            {isLoading ? (
              <>
                <div className="loading loading-spinner loading-sm mr-2"></div>
                Wird erstellt...
              </>
            ) : (
              'Erstellen'
            )}
          </button>
        </div>
      </form>
    </ModalLayout>
  );
} 