import json
from app.core.config import RESUME_SCHEMA, COVERLETTER_SCHEMA  # oder SCHEMAS["resume"], SCHEMAS["coverletter"]
from app.utils.resume_formatter import simplify_optimized_resume
from app.utils.prompts import system_prompt_resume_coverletter_analysis_after_optimize_part_resume
from app.utils.prompts import system_prompt_resume_coverletter_analysis_after_optimize_part_coverletter

def get_prompt_messages_optimized_resume(job_description: dict,
                       cover_letter: dict,
                       resume: dict,
                       language: str = "en") -> list:
    """
    Erzeugt eine Liste von Nachrichten (System + User), um einen
    ATS-/Recruiting-Check durchzuführen.
    
    :param job_description:  Strukturiertes JSON der JobDescription
    :param cover_letter:     Strukturiertes JSON des Anschreibens
    :param resume:           Strukturiertes JSON des Lebenslaufs
    :param language:         'en' | 'de' | 'pl' (Standardsprache: en)
    :return: Liste [{'role': 'system', 'content': '...'},
                    {'role': 'user',   'content': '...'}]
    """

    # ----------------------------------------------------
    # 1) Definiere unsere Ziel-Ausgabe-Struktur als String
    # ----------------------------------------------------
    structure = RESUME_SCHEMA.strip()

    # -----------------------------------------------
    # 2) JSON-Dumps für JobDescription / CoverLetter / Resume
    # -----------------------------------------------
    job_desc_str = json.dumps(job_description, ensure_ascii=False, indent=2)
    cover_letter_str = simplify_optimized_resume(cover_letter)
    resume_str = simplify_optimized_resume(resume)

    # -----------------------------------------------
    # 3) System-Prompts in verschiedenen Sprachen
    # -----------------------------------------------
    system_base = system_prompt_resume_coverletter_analysis_after_optimize_part_resume()
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
    # -----------------------------------------------
    # 4) User-Prompts in verschiedenen Sprachen
    # -----------------------------------------------
    user_prompts = {
        "en": f"""
Below are the three JSON inputs:

JOB DESCRIPTION (JSON):
{job_desc_str}

COVER LETTER (contains *SUGGESTION* markers):
{cover_letter_str}

RESUME (contains *SUGGESTION* markers):
{resume_str}

All field names (keys) must be in English.
The contents (values) remain in English.
Follow the instructions above and return only JSON in this structure:

{structure}
""",
        "de": f"""
Untenstehend findest du die drei JSON-Daten:

STELLENBESCHREIBUNG (JobDescription):
{job_desc_str}

ANSCHREIBEN (CoverLetter, (enthält *SUGGESTION*-Markierungen):
{cover_letter_str}

LEBENSLAUF (Resume, enthält *SUGGESTION*-Markierungen):
{resume_str}

Alle Feldnamen (keys) müssen auf Englisch sein.
Die Inhalte (Werte) bleiben auf Deutsch.
Bitte befolge die obigen Anweisungen und liefere nur ein reines JSON-Objekt in dieser Struktur:

{structure}
""",
        "pl": f"""
Poniżej znajdują się trzy dane w formacie JSON:

OPIS STANOWISKA (JobDescription):
{job_desc_str}

LIST MOTYWACYJNY (CoverLetter, zawiera oznaczenia *SUGGESTION*):
{cover_letter_str}

CV (Resume, zawiera oznaczenia *SUGGESTION*):
{resume_str}

Wszystkie nazwy pól (klucze) muszą być w języku angielskim.
Zawartość (wartości) pozostaje w języku polskim.
Postępuj zgodnie z powyższymi instrukcjami i zwróć wyłącznie obiekt JSON w poniższej strukturze:

{structure}
"""
    }

    # -----------------------------------------------
    # 5) Zusammenbau der Prompts
    # -----------------------------------------------
    return [
        {"role": "system", "content": system_prompt.strip()},
        {"role": "user", "content": user_prompts.get(language, user_prompts["en"]).strip()}
    ]

def get_prompt_messages_optimized_coverletter(job_description: dict,
                       cover_letter: dict,
                       language: str = "en") -> list:
    """
    Erzeugt eine Liste von Nachrichten (System + User), um einen
    ATS-/Recruiting-Check durchzuführen.
    
    :param job_description:  Strukturiertes JSON der JobDescription
    :param cover_letter:     Strukturiertes JSON des Anschreibens
    :param resume:           Strukturiertes JSON des Lebenslaufs
    :param language:         'en' | 'de' | 'pl' (Standardsprache: en)
    :return: Liste [{'role': 'system', 'content': '...'},
                    {'role': 'user',   'content': '...'}]
    """

    # ----------------------------------------------------
    # 1) Definiere unsere Ziel-Ausgabe-Struktur als String
    # ----------------------------------------------------
    structure = COVERLETTER_SCHEMA.strip()

    # -----------------------------------------------
    # 2) JSON-Dumps für JobDescription / CoverLetter / Resume
    # -----------------------------------------------
    job_desc_str = json.dumps(job_description, ensure_ascii=False, indent=2)
    cover_letter_str = simplify_optimized_resume(cover_letter)

    # -----------------------------------------------
    # 3) System-Prompts in verschiedenen Sprachen
    # -----------------------------------------------
    system_base = system_prompt_resume_coverletter_analysis_after_optimize_part_coverletter()
    lang = system_base.get(language, system_base["en"])
    system_prompt = f"""
            {lang['intro']}
            {lang['input_desc']}
            {lang['instructions']}
            {lang['format']}
            {structure}
            """


    # -----------------------------------------------
    # 4) User-Prompts in verschiedenen Sprachen
    # -----------------------------------------------
    user_prompts = {
        "en": f"""
Below are the three JSON inputs:

JOB DESCRIPTION (JSON):
{job_desc_str}

COVER LETTER (contains *SUGGESTION* markers):
{cover_letter_str}

All field names (keys) must be in English.
The contents (values) remain in English.
Follow the instructions above and return only JSON in this structure:

{structure}
""",
        "de": f"""
Untenstehend findest du die drei JSON-Daten:

STELLENBESCHREIBUNG (JobDescription):
{job_desc_str}

ANSCHREIBEN (CoverLetter, (enthält *SUGGESTION*-Markierungen):
{cover_letter_str}

Alle Feldnamen (keys) müssen auf Englisch sein.
Die Inhalte (Werte) bleiben auf Deutsch.
Bitte befolge die obigen Anweisungen und liefere nur ein reines JSON-Objekt in dieser Struktur:

{structure}
""",
        "pl": f"""
Poniżej znajdują się trzy dane w formacie JSON:

OPIS STANOWISKA (JobDescription):
{job_desc_str}

LIST MOTYWACYJNY (CoverLetter, zawiera oznaczenia *SUGGESTION*):
{cover_letter_str}

Wszystkie nazwy pól (klucze) muszą być w języku angielskim.
Zawartość (wartości) pozostaje w języku polskim.
Postępuj zgodnie z powyższymi instrukcjami i zwróć wyłącznie obiekt JSON w poniższej strukturze:

{structure}
"""
    }

    # -----------------------------------------------
    # 5) Zusammenbau der Prompts
    # -----------------------------------------------
    return [
        {"role": "system", "content": system_prompt.strip()},
        {"role": "user", "content": user_prompts.get(language, user_prompts["en"]).strip()}
    ]

