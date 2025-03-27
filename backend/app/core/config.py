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