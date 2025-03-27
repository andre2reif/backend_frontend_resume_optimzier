from pydantic import BaseModel
from typing import List, Optional, Dict

class CareerItem(BaseModel):
    position: str
    company: str
    time_period: str
    tasks: List[str]
    achievements: List[str]
    tools_technologies: List[str]

class KeySkillItem(BaseModel):
    category: str
    skills: List[str]

class OptionalItem(BaseModel):
    title: str
    items: List[str]

class Resume(BaseModel):
    summary: Dict[str, str]
    personal_statement: str
    references: List[Dict[str, str]]
    career: List[CareerItem]
    key_skills: Dict[str, List[KeySkillItem]]
    education: Dict[str, List[str]]
    languages: Dict[str, List[str]]
    optionals: Optional[List[OptionalItem]] = None
