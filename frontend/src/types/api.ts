// Resume Types
export interface Resume {
  id?: string;
  _id?: string;  // MongoDB ID
  title: string;
  content?: string;
  rawText?: string;  // Backend verwendet rawText
  status?: string;
  preview?: string;
  userId?: string;  // Hinzugefügt für die Benutzer-ID
  structured_resume?: {
    summary?: {
      experience?: string;
      key_aspects?: string[];
    };
    personal_statement?: string;
    career?: Array<{
      position: string;
      company: string;
      time_period: string;
      tasks: string[];
      achievements: string[];
    }>;
    key_skills?: {
      items: Array<{
        category: string;
        skills: string[];
      }>;
    };
    education?: {
      items: string[];
    };
    languages?: {
      items: string[];
    };
    optionals?: Array<{
      title: string;
      items: string[];
    }>;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UpdateResumeData {
  title: string;
  content: string;
  user_id?: string;  // Optional, da wir es aus der Session holen
  structured_resume?: Resume['structured_resume'];
}

export interface ResumeAnalysis {
  ats_score: {
    total_score: number;
    score_breakdown: {
      keyword_density: number;
      skill_alignment: number;
      format_compliance: number;
    };
  };
  match_score: {
    matching_skills: string[];
    missing_skills: string[];
  };
  improvement_suggestions: {
    resume_suggestions: string;
  };
  summary: string;
}

// Cover Letter Types
export interface StructuredCoverLetter {
  cover_letter: {
    sender: {
      name: string;
      address: string;
      phone: string;
      email: string;
    };
    recipient: {
      name: string;
      company: string;
      address: string;
    };
    date: string;
    subject: string;
    reference: string;
    salutation: string;
    paragraphs: {
      introduction: string;
      motivation: string;
      experience_summary: string;
      company_alignment: string;
      added_value: string;
      salary_expectation: string;
      closing: string;
      signature: string;
    };
  };
}

export interface CoverLetter {
  id: string;
  title: string;
  rawText: string;
  status: 'draft' | 'structured_complete' | 'optimized' | 'unstructured';
  createdAt: string;
  updatedAt: string;
  structured_coverletter?: StructuredCoverLetter;
  optimized_coverletter?: StructuredCoverLetter;
}

export interface UpdateCoverletterData {
  title?: string;
  rawText?: string;
  language?: string;
  status?: CoverLetter['status'];
  structured_coverletter?: CoverLetter['structured_coverletter'];
  optimized_coverletter?: CoverLetter['optimized_coverletter'];
  optimized_status?: CoverLetter['optimized_status'];
  user_id?: string;
}

export interface CoverLetterAnalysis {
  ats_score: number;
  match_score: number;
  improvement_suggestions: string[];
  summary: string;
}

// Job Description Types
export interface jobdescription {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  preview?: string;
  status: 'draft' | 'analyzed';
}

// Credits Types
export interface CreditBalance {
  balance: number;
}

export interface CreditHistory {
  id: string;
  amount: number;
  type: 'purchase' | 'usage';
  description: string;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
}

// API Error Types
export interface ApiError {
  message: string;
  code: string;
  status: number;
}

export interface Analysis {
  analysis_id: string;
  status: 'pending' | 'completed' | 'failed';
  analysisResult: {
    ats_score: number;
    match_score: number;
    improvement_suggestions: string[];
    summary: string;
  };
}

export type PatchOperation = {
  op: 'replace' | 'add' | 'remove';
  path: string;
  value?: any;
}

export interface ResumePatch {
  operations: PatchOperation[];
  user_id: string;
}

export interface CreateCoverLetterRequest {
  title: string;
  rawText: string;
  language?: string;
  userId: string;
}

export interface UpdateCoverLetterRequest {
  title?: string;
  rawText?: string;
  language?: string;
  status?: CoverLetter['status'];
  structured_coverletter?: CoverLetter['structured_coverletter'];
  optimized_coverletter?: CoverLetter['optimized_coverletter'];
  optimized_status?: CoverLetter['optimized_status'];
} 