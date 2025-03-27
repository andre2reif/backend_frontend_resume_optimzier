# config.py

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