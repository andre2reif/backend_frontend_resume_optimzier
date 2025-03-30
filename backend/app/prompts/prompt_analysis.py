import json
from app.core.config import ANALYSIS_SCHEMA  # oder SCHEMAS["analysis"]

def get_prompt_messages(job_description: dict,
                       cover_letter: dict,
                       resume: dict,
                       language: str = "en") -> list:
    """
    Erzeugt eine Liste von Nachrichten (System + User), um einen
    ATS-/Recruiting-Check durchzuführen.
    
    :param job_description:  Strukturiertes JSON der jobdescription
    :param cover_letter:     Strukturiertes JSON des Anschreibens
    :param resume:           Strukturiertes JSON des Lebenslaufs
    :param language:         'en' | 'de' | 'pl' (Standardsprache: en)
    :return: Liste [{'role': 'system', 'content': '...'},
                    {'role': 'user',   'content': '...'}]
    """

    # ----------------------------------------------------
    # 1) Definiere unsere Ziel-Ausgabe-Struktur als String
    # ----------------------------------------------------
    structure = ANALYSIS_SCHEMA.strip()

    # -----------------------------------------------
    # 2) JSON-Dumps für jobdescription / CoverLetter / Resume
    # -----------------------------------------------
    job_desc_str = json.dumps(job_description, ensure_ascii=False, indent=2)
    cover_letter_str = json.dumps(cover_letter, ensure_ascii=False, indent=2)
    resume_str = json.dumps(resume, ensure_ascii=False, indent=2)

    # -----------------------------------------------
    # 3) System-Prompts in verschiedenen Sprachen
    # -----------------------------------------------
    system_prompts = {
        "en": (
            '''
            You are a cutting-edge ATS and recruiting expert with in-depth expertise 
            in skill matching, keyword analysis and HR processes.

            I will give you the following:
            1) A job description (jobdescription) as JSON
            2) A cover letter (CoverLetter) as JSON
            3) A curriculum vitae (Resume) as JSON

            Your task:
            1) Determine the ATS score, differentiated into total_score and score_breakdown (keyword_density, skill_alignment, format_compliance).
            2) Determine the match score, also with total_score, as well as matching_skills, missing_skills and additional_keywords.
            3) Create a recruiter assessment (invite_reason, reject_reason, culture_fit_estimate, additional_observations).
            4) Make concrete suggestions for improvement, divided into resume_suggestions, coverletter_suggestions and overall_suggestions.
            5) Create a summary in at least 3-5 sentences.

            IMPORTANT: You must return ONLY a valid JSON object that exactly matches the following structure, without any additional text or explanation:
            '''
            ),
        "de": (
           '''Du bist ein hochmoderner ATS- und Recruiting-Experte mit fundiertem Fachwissen 
            im Bereich Skill-Matching, Keyword-Analysen und HR-Prozesse.

            Ich werde dir Folgendes geben:
            1) Eine Stellenbeschreibung (jobdescription) als JSON
            2) Ein Anschreiben (CoverLetter) als JSON
            3) Einen Lebenslauf (Resume) als JSON

            Deine Aufgabe:
            1) Ermittle den ATS-Score, differenziert in total_score und score_breakdown (keyword_density, skill_alignment, format_compliance).
            2) Ermittle den Match-Score, ebenfalls mit total_score, sowie matching_skills, missing_skills und additional_keywords.
            3) Erstelle eine Recruiter-Einschätzung (invite_reason, reject_reason, culture_fit_estimate, additional_observations).
            4) Mach konkrete Verbesserungsvorschläge, aufgeteilt in resume_suggestions, coverletter_suggestions und overall_suggestions.
            5) Erstelle eine Zusammenfassung in mindestens 3–5 Sätzen.

            WICHTIG: Du musst NUR ein gültiges JSON-Objekt zurückgeben, das exakt der folgenden Struktur entspricht, ohne zusätzlichen Text oder Erklärungen:
            '''
        ),
        "pl": (
            '''Jesteś najnowocześniejszym ekspertem ds. ATS i rekrutacji z dogłębną wiedzą specjalistyczną w zakresie 
            w dopasowywaniu umiejętności, analizie słów kluczowych i procesach HR.

            Dostarczę Ci następujące elementy:
            1) Opis stanowiska (jobdescription) jako JSON
            2) List motywacyjny (CoverLetter) w formacie JSON
            3) Życiorys (Resume) jako JSON

            Twoje zadanie:
            1) Określić wynik ATS, z podziałem na total_score i score_breakdown (keyword_density, skill_alignment, format_compliance).
            2) Określ wynik dopasowania, również z uwzględnieniem total_score, a także matching_skills, missing_skills i additional_keywords.
            3) Utworzenie oceny rekrutera (invite_reason, reject_reason, culture_fit_estimate, additional_observations).
            4) Przedstaw konkretne sugestie dotyczące ulepszeń, podzielone na sugestie dotyczące CV, sugestie dotyczące listu motywacyjnego i ogólne sugestie.
            5) Utwórz podsumowanie w co najmniej 3-5 zdaniach.

            WAŻNE: Musisz zwrócić TYLKO prawidłowy obiekt JSON, który dokładnie odpowiada poniższej strukturze, bez dodatkowego tekstu lub wyjaśnień:
            ''')
    }

    # -----------------------------------------------
    # 4) User-Prompts in verschiedenen Sprachen
    # -----------------------------------------------
    user_prompts = {
        "en": f"""
Below are the three JSON inputs:

JOB DESCRIPTION (JSON):
{job_desc_str}

COVER LETTER (JSON):
{cover_letter_str}

RESUME (JSON):
{resume_str}

All field names (keys) must be in English.
The contents (values) remain in English.
Follow the instructions above and return only JSON in this structure:

{structure}
""",
        "de": f"""
Untenstehend findest du die drei JSON-Daten:

STELLENBESCHREIBUNG (jobdescription):
{job_desc_str}

ANSCHREIBEN (CoverLetter):
{cover_letter_str}

LEBENSLAUF (Resume):
{resume_str}

Alle Feldnamen (keys) müssen auf Englisch sein.
Die Inhalte (Werte) bleiben auf Deutsch.
Bitte befolge die obigen Anweisungen und liefere nur ein reines JSON-Objekt in dieser Struktur:

{structure}
""",
        "pl": f"""
Poniżej znajdują się trzy dane w formacie JSON:

OPIS STANOWISKA (jobdescription):
{job_desc_str}

LIST MOTYWACYJNY (CoverLetter):
{cover_letter_str}

CV (Resume):
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
    # Fallback: default auf Englisch, wenn nicht en/de/pl
    system_prompt_template = system_prompts.get(language, system_prompts["en"])
    user_prompt_template = user_prompts.get(language, user_prompts["en"])

    # Systemprompt (mit dem JSON-Schema angehängt)
    system_prompt = system_prompt_template + "\n\n" + structure

    return [
        {"role": "system", "content": system_prompt.strip()},
        {"role": "user", "content": user_prompt_template.strip()}
    ]
