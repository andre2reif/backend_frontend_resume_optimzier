import json
from app.core.config import jobdescription_SCHEMA  # oder SCHEMAS["jobdescription"]

def get_prompt_messages(resume_content: dict, language: str = "en") -> list:
    structure = jobdescription_SCHEMA
    input_text = json.dumps(resume_content, ensure_ascii=False, indent=2)
    system_prompts = {
        "de": (
            '''
                Du bist ein KI-System, das Stellenausschreibungen in ein festes JSON-Format überführt. 
                Ich werde dir eine deutschsprachige Stellenausschreibung geben und du sollst Folgendes tun:

                1. Lies die gesamte Stellenausschreibung und extrahiere die relevanten Informationen.
                2. Verwende ausschließlich die folgenden Felder auf Top-Ebene in deinem JSON:
                  - job_title
                  - company
                  - location
                  - remote_option
                  - salary_range
                  - job_overview
                  - responsibilities (Liste)
                  - skills (Objekt mit 'hard_skills' und 'soft_skills')
                  - benefits (Liste)
                  - application_process (Objekt)
                  - additional_information

                3. Für 'skills' unterscheide bitte zwischen 'hard_skills' und 'soft_skills'. 
                  Bei jeder Fähigkeit gebe bitte zusätzlich einen 'importance_level' an. 
                  Mögliche Werte: 'must_have' oder 'recommended'.

                4. Stelle sicher, dass du alle Felder befüllst, auch wenn manche Felder leer bleiben. 
                  Gib ausschließlich ein reines JSON-Objekt aus. 
                  Keine Codeblöcke, keine Markdown-Formatierung, keine Kommentare.

                5. Das JSON-Objekt soll vollständig auf Deutsch bleiben, jedoch mit den obigen englischen Schlüsselwörtern.

                Liefere ausschließlich ein einzelnes JSON-Objekt als Antwort, ohne Einleitung oder Erklärung.
                '''
        ),
        "en": (
            '''
                You are an AI system that converts job postings into a fixed JSON format. 
                I'm going to give you a job posting in German and I want you to do the following:

                1. read the entire job posting and extract the relevant information.
                2. use only the following top-level fields in your JSON:
                  - job_title
                  - company
                  - location
                  - remote_option
                  - salary_range
                  - job_overview
                  - responsibilities (list)
                  - skills (object with 'hard_skills' and 'soft_skills')
                  - benefits (list)
                  - application_process (object)
                  - additional_information

                3. for 'skills' please differentiate between 'hard_skills' and 'soft_skills'. 
                  For each skill, please also enter an 'importance_level'. 
                  Possible values: 'must_have' or 'recommended'.

                4. make sure that you fill in all fields, even if some fields remain empty. 
                  Only output a pure JSON object. 
                  No code blocks, no Markdown formatting, no comments.

                5. the JSON object should remain entirely in English and with the above English keywords.

                Provide only a single JSON object as a response, without introduction or explanation.
                '''
        ),
        "pl": (
            '''
                Jesteś systemem sztucznej inteligencji, który konwertuje ogłoszenia o pracę na stały format JSON. 
                Dam ci ogłoszenie o pracę w języku niemieckim i chcę, abyś wykonał następujące czynności:

                1. przeczytać całe ogłoszenie o pracę i wyodrębnić istotne informacje.
                2. użyj tylko następujących pól najwyższego poziomu w swoim JSON:
                  - job_title
                  - firma
                  - lokalizacja
                  - remote_option
                  - salary_range
                  - job_overview
                  - obowiązki (lista)
                  - umiejętności (obiekt z "hard_skills" i "soft_skills")
                  - benefity (lista)
                  - application_process (obiekt)
                  - additional_information

                3. w przypadku "umiejętności" należy rozróżnić między "hard_skills" i "soft_skills". 
                  Dla każdej umiejętności należy również wprowadzić "importance_level". 
                  Możliwe wartości: "must_have" lub "recommended".

                4. Upewnij się, że wypełniłeś wszystkie pola, nawet jeśli niektóre z nich pozostały puste. 
                  Wyprowadź tylko czysty obiekt JSON. 
                  Bez bloków kodu, bez formatowania Markdown, bez komentarzy.

                5. Obiekt JSON powinien pozostać w całości w języku polskim, ale z powyższymi angielskimi słowami kluczowymi.

                Dostarczenie tylko jednego obiektu JSON jako odpowiedzi, bez wstępu lub wyjaśnienia.
                '''
        )
    }

    user_prompts = {
        "en": f"""IMPORTANT:
- All field names (keys) must be in English.
- The values (content) must be in the target language: English.
- Return only a pure JSON object (no markdown, no code block, no comments).
- All main sections must be included, even if some contain empty arrays.

The JSON must follow this structure:

{structure}

Here is the job description:
{input_text}
""",
        "de": f"""WICHTIG:
- Alle Feldnamen (keys) müssen auf Englisch sein.
- Die Inhalte (Werte) bleiben auf Deutsch.
- Gib nur ein reines JSON-Objekt zurück – kein Markdown, keine Codeblöcke, keine Kommentare.
- Alle Hauptbereiche müssen enthalten sein – auch wenn sie leer.

Die JSON-Struktur sieht wie folgt aus:
{structure}

Hier ist die Stellenausschreibung:
{input_text}
""",
        "pl": f"""WAŻNE:
- Wszystkie nazwy pól (klucze) muszą być w języku angielskim.
- Zawartość (wartości) pozostaje w języku niemieckim.
- Zwróć tylko czysty obiekt JSON - bez Markdown, bez bloków kodu, bez komentarzy.
- Wszystkie główne pola muszą zostać uwzględnione - nawet jeśli są puste.

Struktura JSON wygląda następująco:
{structure}

Oto ogłoszenie o pracę:
{input_text}
"""
    }

    system_prompt_template = system_prompts.get(language, system_prompts["en"])
    user_prompt = user_prompts.get(language, user_prompts["en"])

    # 5) Erzeuge die finalen Prompt-Inhalte (mit {}-Platzhaltern für structure und letter_text)
    system_prompt = (
        system_prompt_template
        + "\n\n"
        + structure.strip()  # Das JSON-Schema kann optional angehängt werden
    )


    return [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]
