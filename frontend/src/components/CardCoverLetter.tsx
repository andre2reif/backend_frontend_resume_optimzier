'use client'

import { useState } from 'react'
import { useTranslation } from '@/lib/i18n/client'
import { CoverLetter } from '@/types/api'
import { formatDate } from '@/lib/utils/date'
import { showErrorToast } from '@/lib/toast/utils'

interface CardCoverLetterProps {
  coverLetter: CoverLetter
  onDelete: (id: string) => Promise<void>
}

export default function CardCoverLetter({ coverLetter, onDelete }: CardCoverLetterProps) {
  const { t } = useTranslation('cover-letters')
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(t('card.confirmDelete'))) return

    try {
      setIsDeleting(true)
      await onDelete(coverLetter._id)
    } catch (error) {
      console.error('Fehler beim Löschen:', error)
      showErrorToast(t('errors.deleteFailed'))
    } finally {
      setIsDeleting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'structured':
        return 'bg-blue-100 text-blue-800'
      case 'optimized':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {coverLetter.structured_coverLetter?.header.position || t('card.untitled')}
          </h3>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(coverLetter.status)}`}>
            {t(`card.status.${coverLetter.status}`)}
          </span>
        </div>

        <div className="text-sm text-gray-500 mb-4">
          <p>{t('card.lastUpdated')}: {formatDate(coverLetter.updatedAt)}</p>
        </div>

        <div className="flex justify-between items-center">
          <div className="space-x-2">
            <a
              href={`/cover-letters/${coverLetter._id}`}
              className="btn btn-sm btn-primary"
            >
              {t('card.edit')}
            </a>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="btn btn-sm btn-ghost text-red-600 hover:text-red-700"
            >
              {isDeleting ? t('card.deleting') : t('card.delete')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 