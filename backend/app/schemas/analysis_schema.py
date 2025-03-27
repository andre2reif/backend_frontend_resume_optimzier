from pydantic import BaseModel
from typing import List, Dict

class ScoreBreakdown(BaseModel):
    keyword_density: float
    skill_alignment: float
    format_compliance: float

class AtsScore(BaseModel):
    total_score: float
    score_breakdown: ScoreBreakdown

class MatchScore(BaseModel):
    total_score: float
    matching_skills: List[str]
    missing_skills: List[str]
    additional_keywords: List[str]

class RecruiterEvaluation(BaseModel):
    invite_reason: str
    reject_reason: str
    culture_fit_estimate: str
    additional_observations: str

class ImprovementSuggestions(BaseModel):
    resume_suggestions: str
    coverletter_suggestions: str
    overall_suggestions: str

class Analysis(BaseModel):
    ats_score: AtsScore
    match_score: MatchScore
    recruiter_evaluation: RecruiterEvaluation
    improvement_suggestions: ImprovementSuggestions
    summary: str

class CoverLetterAnalysis(BaseModel):
    tone: str
    clarity: str
    relevance: str
    alignment_with_job: str
    creative_improvement_suggestions: str
    summary: str
