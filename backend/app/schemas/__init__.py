from .resume_schema import Resume, CareerItem, KeySkillItem, OptionalItem
from .coverletter_schema import CoverLetter, Sender, Recipient, Paragraphs
from .jobdescription_schema import jobdescription, Skills, ApplicationProcess
from .analysis_schema import (
    Analysis, AtsScore, MatchScore, RecruiterEvaluation,
    ImprovementSuggestions, CoverLetterAnalysis
)

__all__ = [
    'Resume', 'CareerItem', 'KeySkillItem', 'OptionalItem',
    'CoverLetter', 'Sender', 'Recipient', 'Paragraphs',
    'jobdescription', 'Skills', 'ApplicationProcess',
    'Analysis', 'AtsScore', 'MatchScore', 'RecruiterEvaluation',
    'ImprovementSuggestions', 'CoverLetterAnalysis'
]
