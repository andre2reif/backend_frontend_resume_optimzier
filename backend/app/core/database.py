from pymongo import MongoClient
import certifi
from app.core.config import settings

# MongoDB Client initialisieren
client_db = MongoClient(
    settings.MONGODB_URI,
    tls=True,
    tlsCAFile=certifi.where()
)

# Collections für Resume
db_resume = client_db["resume_db"]
collection_resume = db_resume["resumes"]

# Collections für Cover Letter
db_coverletter = client_db["coverletter_db"]
collection_coverletter = db_coverletter["coverLetter"]

# Collections für jobdescription
db_jobdesc = client_db["jobposting_db"]
collection_jobdesc = db_jobdesc["jobPostings"]

# Collection für die Analyse
db_analysis = client_db["analysis_db"]
collection_analysis = db_analysis["analysis"]
