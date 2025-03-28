// Resume Types
export interface Resume {
  id: string;
  title: string;
  content?: string;
  rawText?: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  preview?: string;
  userId?: string;
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
  company: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
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
  status: string;
  message: string;
  data: T;
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