# config.py

import os
from dotenv import load_dotenv

load_dotenv()

# OpenAI Konfiguration
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4")
MAX_TOKENS = 12000

# MongoDB Konfiguration
MONGODB_URI = os.getenv("MONGODB_URI")

# API Keys
RESUME_OPENAI_API_KEY = os.getenv("RESUME_OPENAI_API_KEY")

# Überprüfe, ob alle notwendigen Umgebungsvariablen gesetzt sind
required_env_vars = [
    "MONGODB_URI",
    "RESUME_OPENAI_API_KEY",
    "OPENAI_MODEL"
]

for var in required_env_vars:
    if not os.getenv(var):
        raise ValueError(f"{var} is not set. Check your .env file.")

# Schemas
RESUME_SCHEMA = """
{
  "summary": {
    "experience": "...",
    "key_aspects": ["...", "..."]
  },
  "personal_statement": "...",
  "references": [
    {
      "source": "...",
      "statement": "..."
    }
  ],
  "career": [
    {
      "position": "...",
      "company": "...",
      "time_period": "...",
      "tasks": ["...", "..."],
      "achievements": ["...", "..."],
      "tools_technologies": ["...", "..."]
    }
  ],
  "key_skills": {
    "title": "Key Skills",
    "items": [
      {
        "category": "...",
        "skills": ["...", "..."]
      }
    ]
  },
  "education": {
    "title": "Education",
    "items": ["...", "..."]
  },
  "languages": {
    "title": "Languages",
    "items": ["...", "..."]
  },
  "optionals": [
    {
      "title": "AI/ML Focus Projects",
      "items": ["...", "..."]
    },
    {
      "title": "Hobbies",
      "items": ["...", "..."]
    },
    {
      "title": "Awards",
      "items": ["...", "..."]
    }
  ]
}
"""

COVERLETTER_SCHEMA = """
{
  "cover_letter": {
    "sender": {
      "name": "",
      "address": "",
      "phone": "",
      "email": ""
    },
    "recipient": {
      "name": "",
      "company": "",
      "address": ""
    },
    "date": "",
    "subject": "",
    "reference": "",
    "salutation": "",
    "paragraphs": {
      "introduction": "",
      "motivation": "",
      "experience_summary": "",
      "company_alignment": "",
      "added_value": "",
      "salary_expectation": "",
      "closing": "",
      "signature": ""
    }
  }
}
"""

JOBDESCRIPTION_SCHEMA = """
{
  "job_title": "",
  "company": "",
  "location": "",
  "remote_option": "",
  "salary_range": "",
  "job_overview": "",
  "responsibilities": [],
  "skills": {
    "hard_skills": [],
    "soft_skills": []
  },
  "benefits": [],
  "application_process": {
    "contact_person": "",
    "contact_details": "",
    "steps_to_apply": ""
  },
  "additional_information": ""
}
"""

ANALYSIS_SCHEMA = """
{
  "analysis": {
    "ats_score": {
      "total_score": 0,
      "score_breakdown": {
        "keyword_density": 0,
        "skill_alignment": 0,
        "format_compliance": 0
      }
    },
    "match_score": {
      "total_score": 0,
      "matching_skills": [],
      "missing_skills": [],
      "additional_keywords": []
    },
    "recruiter_evaluation": {
      "invite_reason": "",
      "reject_reason": "",
      "culture_fit_estimate": "",
      "additional_observations": ""
    },
    "improvement_suggestions": {
      "resume_suggestions": "",
      "coverletter_suggestions": "",
      "overall_suggestions": ""
    },
    "summary": ""
  }
}
"""

COVERLETTER_ANALYSIS_SCHEMA = """
{
  "cover_letter_analysis": {
    "tone": "",
    "clarity": "",
    "relevance": "",
    "alignment_with_job": "",
    "creative_improvement_suggestions": "",
    "summary": ""
  }
}"""