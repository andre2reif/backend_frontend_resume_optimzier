import json
from config import ANALYSIS_SCHEMA
from utils.resume_formatter import simplify_optimized_resume
from utils.prompts import system_prompt_resume_analysis_after_optimize

def get_prompt_messages(job_description: dict,
                        cover_letter: dict,
                        optimized_resume: dict,
                        language: str = "en") -> list:
    """
    Erzeugt eine Liste von Nachrichten (System + User), um eine
    ATS-/Recruiting-Analyse auf Basis des optimierten Lebenslaufs durchzuführen.
    """

    structure = ANALYSIS_SCHEMA.strip()

    job_desc_str = json.dumps(job_description, ensure_ascii=False, indent=2)
    cover_letter_str = json.dumps(cover_letter, ensure_ascii=False, indent=2)
    resume_str = simplify_optimized_resume(optimized_resume)

    print("📝 Optimized Resume being analyzed:\n")
    print(json.dumps(optimized_resume, indent=2, ensure_ascii=False))

    system_base = system_prompt_resume_analysis_after_optimize()
    lang = system_base.get(language, system_base["en"])
    system_prompt = f"""
            {lang['intro']}
            {lang['input_desc']}
            {lang['ats_logic']}
            {lang['match_logic']}
            {lang['instructions']}
            {lang['format']}
            {structure}
            """

    # ------------------------
    # USER PROMPTS
    # ------------------------
    user_prompts = {
        "en": f"""
        JOB DESCRIPTION:
        {job_desc_str}

        COVER LETTER:
        {cover_letter_str}

        OPTIMIZED RESUME (contains *SUGGESTION* markers):
        {resume_str}
        """,
                "de": f"""
        STELLENBESCHREIBUNG:
        {job_desc_str}

        ANSCHREIBEN:
        {cover_letter_str}

        OPTIMIERTER LEBENSLAUF (enthält *SUGGESTION*-Markierungen):
        {resume_str}
        """,
                "pl": f"""
        OPIS STANOWISKA:
        {job_desc_str}

        LIST MOTYWACYJNY:
        {cover_letter_str}

        CV PO OPTYMALIZACJI (zawiera oznaczenia *SUGGESTION*):
        {resume_str}
        """
    }

    return [
        {"role": "system", "content": system_prompt.strip()},
        {"role": "user", "content": user_prompts.get(language, user_prompts["en"]).strip()}
    ]
