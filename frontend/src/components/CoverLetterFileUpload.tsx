'use client'

import { useState, useCallback } from 'react'
import { useTranslation } from '@/lib/i18n/client'
import { showErrorToast } from '@/lib/toast/utils'
import { API_ENDPOINTS } from '@/config/api'

interface CoverLetterFileUploadProps {
  onSuccess: (title: string, content: string) => Promise<void>
  onClose: () => void
  isOpen: boolean
}

export default function CoverLetterFileUpload({ onSuccess, onClose, isOpen }: CoverLetterFileUploadProps) {
  const { t } = useTranslation('cover-letters')
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [title, setTitle] = useState('')
  const [extractedText, setExtractedText] = useState('')

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (!file) return

    await processFile(file)
  }, [])

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    await processFile(file)
  }, [])

  const processFile = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      showErrorToast(t('errors.fileSize'))
      return
    }

    try {
      setIsUploading(true)
      console.log('Starting file extraction for:', file.name)
      
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch(API_ENDPOINTS.extractText, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Extraction failed:', errorData)
        throw new Error(errorData.detail || t('errors.extractFailed'))
      }

      const { text } = await response.json()
      
      if (!text || text.trim() === '') {
        throw new Error(t('errors.extractFailed'))
      }

      console.log('Text extraction successful, length:', text.length)
      setExtractedText(text)
      setTitle(file.name.replace(/\.[^/.]+$/, ''))
    } catch (error) {
      console.error('Error extracting text:', error)
      showErrorToast(error instanceof Error ? error.message : t('errors.extractFailed'))
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSuccess(title, extractedText)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
            <div className="absolute right-0 top-0 pr-4 pt-4">
              <button
                type="button"
                className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                onClick={onClose}
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
                  {t('upload.coverLetterTitle')}
                </h3>

                <div
                  className={`mt-4 border-2 border-dashed rounded-lg p-6 ${
                    isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <p className="mt-1 text-sm text-gray-600">
                      {t('upload.dropHere')}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {t('upload.supportedFormats')}
                    </p>
                    <div className="mt-4">
                      <label
                        htmlFor="file-upload"
                        className="btn btn-primary cursor-pointer"
                      >
                        {t('upload.dragAndDrop')}
                      </label>
                      <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>
                </div>

                {isUploading && (
                  <div className="mt-4 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-500">
                      {t('upload.uploading')}
                    </p>
                  </div>
                )}

                {extractedText && (
                  <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        {t('copyPaste.form.title')}
                      </label>
                      <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                        {t('copyPaste.form.content')}
                      </label>
                      <textarea
                        id="content"
                        value={extractedText}
                        onChange={(e) => setExtractedText(e.target.value)}
                        rows={10}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                      />
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={onClose}
                      >
                        {t('copyPaste.buttons.cancel')}
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                      >
                        {t('copyPaste.buttons.submit')}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 