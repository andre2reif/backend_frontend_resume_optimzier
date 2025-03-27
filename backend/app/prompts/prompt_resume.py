import json
from app.core.config import RESUME_SCHEMA  # oder SCHEMAS["resume"]

def get_prompt_messages(resume_content: dict, language: str = "en") -> list:
    structure = RESUME_SCHEMA  # oder SCHEMAS["resume"]
    input_text = json.dumps(resume_content, ensure_ascii=False, indent=2)
    system_prompts = {
        "de": (
            "Du bist ein hochmoderner ATS-optimierter Resume-Generator. "
            "Ich werde dir einen bestehenden Lebenslauf geben.\n\n"
            "Deine Aufgabe:\n"
            "1. Identifiziere alle Positionen und notiere sie mit Zeitraum\n"
            "2. Liste für jede Position alle relevanten Tätigkeiten auf\n"
            "3. Liste für jede Position erzielte Erfolge & KPIs auf (falls vorhanden)\n"
            "4. Falls keine Erfolge/KPIs genannt aber für die Position relevant sind, erstelle erste Platzhalter Erfolge\n"
            "5. Identifiziere genutzte Methoden, Tools und Technologien\n"
            "6. Bring alle extrahierten wichtigen Daten in folgende Struktur"
        ),
        "en": (
            "You are a cutting-edge ATS-optimized resume generator. "
            "I will provide you with an existing resume.\n\n"
            "Your task:\n"
            "1. Identify all positions and note the time periods\n"
            "2. List all relevant tasks for each position\n"
            "3. List achievements & KPIs for each position (if available)\n"
            "4. If achievements/KPIs are not listed but relevant, suggest placeholder achievements\n"
            "5. Identify used methods, tools, and technologies\n"
            "6. Provide all extracted data in the following structure"
        ),
        "pl": (
            "Jesteś nowoczesnym generatorem CV zoptymalizowanym pod ATS. "
            "Otrzymasz istniejące CV.\n\n"
            "Twoje zadanie:\n"
            "1. Zidentyfikuj wszystkie stanowiska pracy i określ okres ich trwania\n"
            "2. Wypisz wszystkie istotne obowiązki dla każdej pozycji\n"
            "3. Wypisz osiągnięcia i kluczowe wskaźniki efektywności (KPI), jeśli są dostępne\n"
            "4. Jeśli nie ma wymienionych KPI, zaproponuj przykładowe, które pasują do danej roli\n"
            "5. Zidentyfikuj metody, narzędzia i technologie używane w każdej roli\n"
            "6. Przedstaw wszystkie dane w poniższej strukturze"
        )
    }

    user_prompts = {
        "en": f"""IMPORTANT:
- All field names (keys) must be in English.
- The values (content) must be in the target language: English.
- Return only a pure JSON object (no markdown, no code block, no comments).
- All main sections must be included, even if some contain empty arrays or default placeholders.
- Group 'key_skills' thematically by 'category' and associated 'skills'.
- Any highly individual topics (e.g. 'AI/ML Projects', 'Volunteer Work') should be placed in the 'optionals' section with a fitting title.

The JSON must follow this structure:

{structure}

Here is the resume content:
{input_text}
""",
        "de": f"""WICHTIG:
- Alle Feldnamen (keys) müssen auf Englisch sein.
- Die Inhalte (Werte) bleiben auf Deutsch.
- Gib nur ein reines JSON-Objekt zurück – kein Markdown, keine Codeblöcke, keine Kommentare.
- Alle Hauptbereiche müssen enthalten sein – auch wenn sie leer oder mit Platzhaltern gefüllt sind.
- Gruppiere 'key_skills' thematisch mit 'category' und zugehöriger 'skills'-Liste.
- Besonders individuelle Themen (z. B. 'AI/ML-Projekte', 'Ehrenamt') sollen in den Abschnitt 'optionals' mit passendem Titel eingeordnet werden.

Die JSON-Struktur sieht wie folgt aus:
{structure}

Hier ist der Lebenslauf:
{input_text}
""",
        "pl": f"""WAŻNE:
- Wszystkie nazwy pól (klucze) muszą być po angielsku.
- Zawartość (wartości) pozostaje w języku polskim.
- Zwróć wyłącznie czysty obiekt JSON – bez formatowania Markdown, komentarzy ani bloków kodu.
- Wszystkie główne sekcje muszą być obecne – nawet jeśli zawierają tylko puste listy lub wartości domyślne.
- Grupuj 'key_skills' według kategorii tematycznych przy użyciu pól 'category' i listy 'skills'.
- Wszelkie bardzo indywidualne tematy (np. 'Projekty AI/ML', 'Wolontariat') powinny zostać umieszczone w sekcji 'optionals' z odpowiednim tytułem.

Struktura JSON wygląda tak:
{structure}

Treść CV:
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
