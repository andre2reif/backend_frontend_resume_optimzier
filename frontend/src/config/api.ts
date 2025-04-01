export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

export const API_ENDPOINTS = {
  resumes: {
    getAll: `${API_BASE_URL}/api/v1/resumes/view`,
    getById: `${API_BASE_URL}/api/v1/resumes/view`,
    create: `${API_BASE_URL}/api/v1/resumes/create`,
    patch: `${API_BASE_URL}/api/v1/resumes/patch`,
    delete: `${API_BASE_URL}/api/v1/resumes/delete`,
    analyze: `${API_BASE_URL}/api/v1/resumes/analyze`,
    optimize: `${API_BASE_URL}/api/v1/resumes/optimize`,
    structure: `${API_BASE_URL}/api/v1/resumes/structure`,
    extractStructured: `${API_BASE_URL}/extract-structured-document`
  },
  coverLetters: {
    getAll: `${API_BASE_URL}/api/v1/coverletters/view`,
    getById: `${API_BASE_URL}/api/v1/coverletters/view`,
    create: `${API_BASE_URL}/api/v1/coverletters/create`,
    patch: `${API_BASE_URL}/api/v1/coverletters/patch`,
    delete: `${API_BASE_URL}/api/v1/coverletters/delete`,
    analyze: `${API_BASE_URL}/api/v1/coverletters/analyze`,
    optimize: `${API_BASE_URL}/api/v1/coverletters/optimize`,
    structure: `${API_BASE_URL}/api/v1/coverletters/structure`,
    extractStructured: `${API_BASE_URL}/extract-structured-document`
  },
  jobdescriptions: {
    getAll: `${API_BASE_URL}/api/v1/jobdescriptions/view`,
    getById: `${API_BASE_URL}/api/v1/jobdescriptions/view`,
    create: `${API_BASE_URL}/api/v1/jobdescriptions/create`,
    delete: `${API_BASE_URL}/api/v1/jobdescriptions/delete`,
    extractStructured: `${API_BASE_URL}/extract-structured-document`,
    analyze: `${API_BASE_URL}/api/v1/jobdescriptions/analyze`
  },
  extractText: `${API_BASE_URL}/extract-text`,
  analyze: `${API_BASE_URL}/api/v1/coverletters/analysis-ats`

} as const 