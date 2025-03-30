import json
from app.core.config import COVERLETTER_SCHEMA  # oder SCHEMAS["coverletter"]
from app.utils.prompts import system_prompt_coverletter_optimize  # Wir definieren einen speziellen System-Prompt

def get_prompt_messages(coverletter_content: dict, job_description: dict, improvement_suggestions: dict, language: str = "en") -> list:
    """
    Erzeugt eine Liste von Nachrichten (System + User), um ein bestehendes Anschreiben (Cover Letter) zu optimieren.
    Neue oder ergänzende Inhalte sollen mit (*SUGGESTION*) markiert werden, während Inhalte, die entfernt werden sollen, mit (*DELETE*) markiert werden.
    Zudem soll der Betreff des Anschreibens (subject) mit den Feldern job_title, company und application_process.contact_person der Jobbeschreibung abgeglichen werden.
    
    :param coverletter_content: Das strukturierte Anschreiben (JSON) gemäß COVERLETTER_SCHEMA.
    :param job_description: Die strukturierte Jobbeschreibung (JSON) gemäß jobdescription_SCHEMA.
    :param improvement_suggestions: Dictionary mit Verbesserungsvorschlägen.
    :param language: 'en' | 'de' | 'pl'
    :return: Liste von Nachrichten für das KI-Modell.
    """
    # 1) Definiere das Ziel-Schema
    structure = COVERLETTER_SCHEMA.strip()

    # 2) Die Inputs als JSON-Strings vorbereiten
    coverletter_str = json.dumps(coverletter_content, ensure_ascii=False, indent=2)
    jobdesc_str = json.dumps(job_description, ensure_ascii=False, indent=2)
    suggestions_str = json.dumps(improvement_suggestions, ensure_ascii=False, indent=2)

    
    # 3) System-Prompt anhand des speziellen Coverletter-Optimierungs-Prompts erstellen
    system_base = system_prompt_coverletter_optimize()  # Neuer System-Prompt speziell für die Optimierung
    lang_data = system_base.get(language, system_base["en"])
    system_prompt = f"""
    {lang_data['intro']}
    {lang_data['input_desc']}
    {lang_data['instructions']}
    {lang_data['compare_instructions']}
    {lang_data['format']}
    {structure}
    """

    # 4) User-Prompt erstellen
    user_prompts = {
        "en": f"""
COVER LETTER (JSON):
{coverletter_str}

JOB DESCRIPTION (JSON):
{jobdesc_str}

IMPROVEMENT SUGGESTIONS:
{suggestions_str}

Ensure the JSON structure remains unchanged.
Return only a single JSON object.
""",
        "de": f"""
ANSCHREIBEN (JSON):
{coverletter_str}

STELLENBESCHREIBUNG (JSON):
{jobdesc_str}

VERBESSERUNGSVORSCHLÄGE:
{suggestions_str}

Behalte die ursprüngliche JSON-Struktur bei.
Gib nur ein einziges JSON-Objekt zurück.
""",
        "pl": f"""
LIST MOTYWACYJNY (JSON):
{coverletter_str}

OPIS STANOWISKA (JSON):
{jobdesc_str}

SUGESTIE ULEPSZEŃ:
{suggestions_str}

Zachowaj strukturę JSON.
Zwróć tylko jeden obiekt JSON.
"""
    }

    return [
        {"role": "system", "content": system_prompt.strip()},
        {"role": "user", "content": user_prompts.get(language, user_prompts["en"]).strip()}
    ]