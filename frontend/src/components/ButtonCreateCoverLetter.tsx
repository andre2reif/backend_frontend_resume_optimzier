'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useTranslation } from '@/lib/i18n/client'
import { coverLetterApi } from '@/lib/api'
import { showErrorToast } from '@/lib/toast/utils'
import CoverLetterWizard from './CoverLetterWizard'
import CoverLetterCopyPaste from './CoverLetterCopyPaste'
import CoverLetterFileUpload from './CoverLetterFileUpload'

interface ButtonCreateCoverLetterProps {
  onSuccess: () => void
}

export default function ButtonCreateCoverLetter({ onSuccess }: ButtonCreateCoverLetterProps) {
  const { t } = useTranslation('cover-letters')
  const { data: session } = useSession()
  const [showModal, setShowModal] = useState(false)
  const [showWizard, setShowWizard] = useState(false)
  const [showCopyPaste, setShowCopyPaste] = useState(false)
  const [showFileUpload, setShowFileUpload] = useState(false)

  const handleCreate = async (title: string, content: string) => {
    try {
      await coverLetterApi.create({
        title,
        content,
        userId: session?.user?.id as string
      })
      setShowModal(false)
      setShowWizard(false)
      setShowCopyPaste(false)
      setShowFileUpload(false)
      onSuccess()
    } catch (error) {
      console.error('Fehler beim Erstellen des Anschreibens:', error)
      showErrorToast(t('errors.createFailed'))
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="btn btn-primary"
      >
        {t('button.create')}
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                    onClick={() => setShowModal(false)}
                  >
                    <span className="sr-only">Schließen</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg font-semibold leading-6 text-gray-900">
                      {t('modal.title')}
                    </h3>
                    <div className="mt-4 space-y-4">
                      <button
                        onClick={() => {
                          setShowModal(false)
                          setShowWizard(true)
                        }}
                        className="w-full btn btn-primary"
                      >
                        {t('modal.wizard')}
                      </button>
                      <button
                        onClick={() => {
                          setShowModal(false)
                          setShowCopyPaste(true)
                        }}
                        className="w-full btn btn-outline"
                      >
                        {t('modal.copyPaste')}
                      </button>
                      <button
                        onClick={() => {
                          setShowModal(false)
                          setShowFileUpload(true)
                        }}
                        className="w-full btn btn-outline"
                      >
                        {t('modal.fileUpload')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showWizard && (
        <CoverLetterWizard
          onSubmit={handleCreate}
          onClose={() => setShowWizard(false)}
        />
      )}

      {showCopyPaste && (
        <CoverLetterCopyPaste
          onSubmit={handleCreate}
          onClose={() => setShowCopyPaste(false)}
        />
      )}

      {showFileUpload && (
        <CoverLetterFileUpload
          onSuccess={handleCreate}
          onClose={() => setShowFileUpload(false)}
        />
      )}
    </>
  )
} 