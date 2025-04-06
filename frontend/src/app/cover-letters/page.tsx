'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/lib/i18n/client'
import { coverLetterApi } from '@/lib/api'
import { CoverLetter } from '@/types/api'
import { showErrorToast } from '@/lib/toast/utils'
import ButtonCreateCoverLetter from '@/components/common/buttons/ButtonCreateCoverLetter'
import CardCoverLetter from '@/components/coverletter/CardCoverletter'

export default function CoverLettersPage() {
  const { t } = useTranslation('cover-letters')
  const { data: session } = useSession()
  const router = useRouter()
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!session?.user?.id) {
      router.push('/auth/signin')
      return
    }

    loadCoverLetters()
  }, [session, router])

  const loadCoverLetters = async () => {
    try {
      setIsLoading(true)
      const data = await coverLetterApi.getAll(session?.user?.id as string)
      setCoverLetters(data)
    } catch (error) {
      console.error('Fehler beim Laden der Anschreiben:', error)
      showErrorToast(t('errors.loadFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await coverLetterApi.delete(id, session?.user?.id as string)
      setCoverLetters(coverLetters.filter(letter => letter._id !== id))
    } catch (error) {
      console.error('Fehler beim Löschen des Anschreibens:', error)
      showErrorToast(t('errors.deleteFailed'))
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {t('page.title')}
        </h1>
        <ButtonCreateCoverLetter onSuccess={loadCoverLetters} />
      </div>

      {coverLetters.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {t('page.noCoverLetters')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coverLetters.map((coverLetter) => (
            <CardCoverLetter
              key={coverLetter._id}
              coverLetter={coverLetter}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
} 