from pydantic import BaseModel
from typing import List, Dict

class Skills(BaseModel):
    hard_skills: List[str]
    soft_skills: List[str]

class ApplicationProcess(BaseModel):
    contact_person: str
    contact_details: str
    steps_to_apply: str

class jobdescription(BaseModel):
    job_title: str
    company: str
    location: str
    remote_option: str
    salary_range: str
    job_overview: str
    responsibilities: List[str]
    skills: Skills
    benefits: List[str]
    application_process: ApplicationProcess
    additional_information: str
