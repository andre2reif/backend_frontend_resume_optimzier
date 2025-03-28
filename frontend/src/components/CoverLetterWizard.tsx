'use client'

import { useState } from 'react'
import { useTranslation } from '@/lib/i18n/client'

interface CoverLetterWizardProps {
  onSubmit: (title: string, content: string) => Promise<void>
  onClose: () => void
}

export default function CoverLetterWizard({ onSubmit, onClose }: CoverLetterWizardProps) {
  const { t } = useTranslation('cover-letters')
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    header: {
      recipientName: '',
      company: '',
      address: '',
      position: ''
    },
    introduction: {
      motivation: ''
    },
    mainContent: {
      experience: '',
      qualification: ''
    },
    closing: {
      closing: '',
      signature: ''
    }
  })

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    const title = formData.header.position
    const content = `
${formData.header.recipientName}
${formData.header.company}
${formData.header.address}

${formData.header.position}

${formData.introduction.motivation}

${formData.mainContent.experience}

${formData.mainContent.qualification}

${formData.closing.closing}

${formData.closing.signature}
    `.trim()

    await onSubmit(title, content)
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('wizard.steps.header')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('wizard.form.recipientName')}
                </label>
                <input
                  type="text"
                  value={formData.header.recipientName}
                  onChange={(e) => setFormData({
                    ...formData,
                    header: { ...formData.header, recipientName: e.target.value }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('wizard.form.company')}
                </label>
                <input
                  type="text"
                  value={formData.header.company}
                  onChange={(e) => setFormData({
                    ...formData,
                    header: { ...formData.header, company: e.target.value }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('wizard.form.address')}
                </label>
                <textarea
                  value={formData.header.address}
                  onChange={(e) => setFormData({
                    ...formData,
                    header: { ...formData.header, address: e.target.value }
                  })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('wizard.form.position')}
                </label>
                <input
                  type="text"
                  value={formData.header.position}
                  onChange={(e) => setFormData({
                    ...formData,
                    header: { ...formData.header, position: e.target.value }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('wizard.steps.introduction')}</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('wizard.form.motivation')}
              </label>
              <textarea
                value={formData.introduction.motivation}
                onChange={(e) => setFormData({
                  ...formData,
                  introduction: { ...formData.introduction, motivation: e.target.value }
                })}
                rows={5}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('wizard.steps.mainContent')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('wizard.form.experience')}
                </label>
                <textarea
                  value={formData.mainContent.experience}
                  onChange={(e) => setFormData({
                    ...formData,
                    mainContent: { ...formData.mainContent, experience: e.target.value }
                  })}
                  rows={5}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('wizard.form.qualification')}
                </label>
                <textarea
                  value={formData.mainContent.qualification}
                  onChange={(e) => setFormData({
                    ...formData,
                    mainContent: { ...formData.mainContent, qualification: e.target.value }
                  })}
                  rows={5}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        )
      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('wizard.steps.closing')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('wizard.form.closing')}
                </label>
                <textarea
                  value={formData.closing.closing}
                  onChange={(e) => setFormData({
                    ...formData,
                    closing: { ...formData.closing, closing: e.target.value }
                  })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('wizard.form.signature')}
                </label>
                <input
                  type="text"
                  value={formData.closing.signature}
                  onChange={(e) => setFormData({
                    ...formData,
                    closing: { ...formData.closing, signature: e.target.value }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

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
                  {t('wizard.title')}
                </h3>
                <div className="mt-4">
                  {renderStep()}
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={onClose}
                  >
                    {t('wizard.buttons.cancel')}
                  </button>
                  {currentStep > 1 && (
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={handleBack}
                    >
                      {t('wizard.buttons.back')}
                    </button>
                  )}
                  {currentStep < 4 ? (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleNext}
                    >
                      {t('wizard.buttons.next')}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleSubmit}
                    >
                      {t('wizard.buttons.finish')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 