export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3002'

export const API_ENDPOINTS = {
  resumes: {
    getAll: `${API_BASE_URL}/api/v1/resumes/view`,
    getById: `${API_BASE_URL}/api/v1/resumes/view`,
    create: `${API_BASE_URL}/api/v1/resumes/create`,
    update: `${API_BASE_URL}/api/v1/resumes/update`,
    delete: `${API_BASE_URL}/api/v1/resumes/delete`,
    analyze: `${API_BASE_URL}/api/v1/resumes/analysis-ats`,
    optimize: `${API_BASE_URL}/api/v1/resumes/optimize-resume-from-analysis`
  },
  coverLetters: {
    getAll: `${API_BASE_URL}/api/v1/coverletters/view`,
    getById: `${API_BASE_URL}/api/v1/coverletters/view`,
    create: `${API_BASE_URL}/api/v1/coverletters/create`,
    update: `${API_BASE_URL}/api/v1/coverletters/update`,
    delete: `${API_BASE_URL}/api/v1/coverletters/delete`,
    extractStructured: `${API_BASE_URL}/api/v1/coverletters/extract-structured-document`,
    optimizeFromAnalysis: `${API_BASE_URL}/api/v1/coverletters/optimize-coverletter-from-analysis`,
    analyze: `${API_BASE_URL}/api/v1/coverletters/analysis-ats`
  },
  extractText: `${API_BASE_URL}/api/v1/extract-text`
} 