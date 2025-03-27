from pydantic import BaseModel
from typing import Dict

class Sender(BaseModel):
    name: str
    address: str
    phone: str
    email: str

class Recipient(BaseModel):
    name: str
    company: str
    address: str

class Paragraphs(BaseModel):
    introduction: str
    motivation: str
    experience_summary: str
    company_alignment: str
    added_value: str
    salary_expectation: str
    closing: str
    signature: str

class CoverLetter(BaseModel):
    sender: Sender
    recipient: Recipient
    date: str
    subject: str
    reference: str
    salutation: str
    paragraphs: Paragraphs
