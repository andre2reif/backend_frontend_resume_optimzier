import json
from app.core.config import RESUME_SCHEMA  # oder SCHEMAS["resume"]
from app.utils.prompts import system_prompt_resume_analysis_before_optimize

def get_prompt_messages(
    resume_content: dict,
    improvement_suggestions: dict,
    language: str = "en"
) -> list:
    """
    Erzeugt eine Liste von Nachrichten (System + User), um einen bestehenden Lebenslauf (resume_content)
    zu optimieren. Neue oder ergänzende Infos sollen mit '(*SUGGESTION*)' gekennzeichnet sein.

    :param resume_content:  Das bereits strukturierte Resume (JSON)
    :param improvement_suggestions: Ein Dictionary, das z.B. zusätzliche Keywords oder textliche Hinweise enthält,
                                    die wir im Lebenslauf ergänzen wollen
    :param language:        'en' | 'de' | 'pl' (Standardsprache: en)
    :return: Liste [{'role': 'system', 'content': '...'}, {'role': 'user', 'content': '...'}]
    """

    # ----------------------------------------------------------------
    # 1) Definiere die bekannte Resume-Struktur (gleich wie prompt_resume.py)
    # ----------------------------------------------------------------
    structure = RESUME_SCHEMA.strip()
    # ----------------------------------------------------------------
    # 2) Die Inputs als JSON-Strings fürs Prompt
    # ----------------------------------------------------------------
    resume_json_str = json.dumps(resume_content, ensure_ascii=False, indent=2)
    suggestions_str = json.dumps(improvement_suggestions, ensure_ascii=False, indent=2)

    # ----------------------------------------------------------------
    # 3) System-Prompt in verschiedenen Sprachen
    # ----------------------------------------------------------------
    system_base = system_prompt_resume_analysis_before_optimize()
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
    
    # ----------------------------------------------------------------
    # 4) User-Prompt in verschiedenen Sprachen
    # ----------------------------------------------------------------
    user_prompts = {
        "en": f"""
Here is the current resume (JSON):
{resume_json_str}

Here are the improvement suggestions:
{suggestions_str}

Please incorporate these suggestions, marking newly added text with (*SUGGESTION*). 
Remember to keep the JSON structure identical. 
Return only a single JSON object.
""",
        "de": f"""
Hier ist der aktuelle Lebenslauf (JSON):
{resume_json_str}

Hier sind die Verbesserungsvorschläge:
{suggestions_str}

Bitte integriere diese Vorschläge und kennzeichne neu hinzugefügten Text mit (*SUGGESTION*).
Behalte die JSON-Struktur bei. 
Gib nur ein einziges JSON-Objekt zurück.
""",
        "pl": f"""
Oto aktualne CV (JSON):
{resume_json_str}

Oto sugestie ulepszeń:
{suggestions_str}

Proszę wprowadzić te sugestie, oznaczając nowo dodany tekst jako (*SUGGESTION*).
Zachowaj strukturę JSON. 
Zwróć tylko jeden obiekt JSON.
"""
    }

    # ----------------------------------------------------------------
    # 5) Zusammenbau der Prompts (System + User)
    # ----------------------------------------------------------------
    user_prompt_template = user_prompts.get(language, user_prompts["en"])

    return [
        {"role": "system", "content": system_prompt.strip()},
        {"role": "user", "content": user_prompt_template.strip()}
    ]
