// Resume Types
export interface Resume {
  id?: string;
  _id?: string;  // MongoDB ID
  title: string;
  content?: string;
  rawText?: string;  // Backend verwendet rawText
  status?: string;
  preview?: string;
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
export interface CoverLetter {
  _id: string;
  userId: string;
  rawText: string;
  language: string;
  status: 'draft' | 'structured' | 'optimized';
  createdAt: string;
  updatedAt: string;
  structured_coverLetter?: {
    header: {
      recipientName: string;
      company: string;
      address: string;
      position: string;
    };
    introduction: {
      motivation: string;
    };
    mainContent: {
      experience: string;
      qualification: string;
    };
    closing: {
      closing: string;
      signature: string;
    };
  };
  optimized_coverLetter?: {
    header: {
      recipientName: string;
      company: string;
      address: string;
      position: string;
    };
    introduction: {
      motivation: string;
    };
    mainContent: {
      experience: string;
      qualification: string;
    };
    closing: {
      closing: string;
      signature: string;
    };
  };
}

export interface CoverLetterAnalysis {
  ats_score: number;
  match_score: number;
  improvement_suggestions: string[];
  summary: string;
}

// Job Description Types
export interface JobDescription {
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
  data?: T;
  message?: string;
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