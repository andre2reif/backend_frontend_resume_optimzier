import json
from app.core.config import COVERLETTER_ANALYSIS_SCHEMA
from app.utils.prompts import system_prompt_coverletter_analysis

# ------------------------
# Funktion zur Erstellung des vollständigen Prompts für die Analyse des Anschreibens
# ------------------------
def get_prompt_messages(cover_letter: dict, job_description: dict, language: str = "en") -> list:
    
    """
    Erzeugt eine Liste von Nachrichten (System + User), um eine
    ATS-/Recruiting-Analyse auf Basis des optimierten Lebenslaufs durchzuführen.
    """

    structure = COVERLETTER_ANALYSIS_SCHEMA.strip()

    cover_letter_str = json.dumps(cover_letter, ensure_ascii=False, indent=2)
    job_desc_str = json.dumps(job_description, ensure_ascii=False, indent=2)

    system_base = system_prompt_coverletter_analysis()
    lang_data = system_base.get(language, system_base["en"])
    system_prompt = f"""
        {lang_data['intro']}
        {lang_data['input_desc']}

        {lang_data['instructions']}

        {lang_data['format']}
        {structure}
        """

    user_prompts = {
                "en": f"""
        COVER LETTER (JSON):
        {cover_letter_str}

        JOB DESCRIPTION (JSON):
        {job_desc_str}
        """,
                "de": f"""
        ANSCHREIBEN (JSON):
        {cover_letter_str}

        STELLENBESCHREIBUNG (JSON):
        {job_desc_str}
        """,
                "pl": f"""
        LIST MOTYWACYJNY (JSON):
        {cover_letter_str}

        OPIS STANOWISKA (JSON):
        {job_desc_str}
        """
        }

    return [
        {"role": "system", "content": system_prompt.strip()},
        {"role": "user", "content": user_prompts.get(language, user_prompts["en"]).strip()}
    ]