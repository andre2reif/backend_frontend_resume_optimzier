export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const API_ENDPOINTS = {
  resumes: {
    getAll: `${API_BASE_URL}/api/v1/resumes/view`,
    getById: `${API_BASE_URL}/api/v1/resumes/view`,
    create: `${API_BASE_URL}/api/v1/resumes/create`,
    patch: `${API_BASE_URL}/api/v1/resumes/patch`,
    delete: `${API_BASE_URL}/api/v1/resumes/delete`,
    analyze: `${API_BASE_URL}/api/v1/resumes/analyze`,
    optimize: `${API_BASE_URL}/api/v1/resumes/optimize-resume-from-analysis`,
    extractStructured: `${API_BASE_URL}/api/v1/resumes/extract-structured`
  },
  coverLetters: {
    getAll: `${API_BASE_URL}/api/v1/coverletters/view`,
    getById: `${API_BASE_URL}/api/v1/coverletters/view`,
    create: `${API_BASE_URL}/api/v1/coverletters/create`,
    delete: `${API_BASE_URL}/api/v1/coverletters/delete`,
    extractStructured: `${API_BASE_URL}/extract-structured-document`,
    analyze: `${API_BASE_URL}/api/v1/coverletters/analysis-ats`
  },
  jobDescriptions: {
    getAll: `${API_BASE_URL}/api/v1/jobdescriptions/view`,
    getById: `${API_BASE_URL}/api/v1/jobdescriptions/view`,
    create: `${API_BASE_URL}/api/v1/jobdescriptions/create`,
    delete: `${API_BASE_URL}/api/v1/jobdescriptions/delete`,
    extractStructured: `${API_BASE_URL}/extract-structured-document`,
    analyze: `${API_BASE_URL}/api/v1/jobdescriptions/analyze`
  },
  extractText: `${API_BASE_URL}/api/v1/extract-text`
} as const 