import json

def get_prompt_messages(resume_content: dict, language: str = "en") -> list:
    structure = """
{
  "cover_letter": {
    "sender": {
      "name": "",
      "address": "",
      "phone": "",
      "email": ""
    },
    "recipient": {
      "name": "",
      "company": "",
      "address": ""
    },
    "date": "",
    "subject": "",
    "reference": "",
    "salutation": "",
    "paragraphs": {
      "introduction": "...",
      "motivation": "...",
      "experience_summary": "...",
      "company_alignment": "...",
      "added_value": "...",
      "salary_expectation": "...",
      "closing": "...",
      "signature": "..."
    }
  }
}
"""

    input_text = json.dumps(resume_content, ensure_ascii=False, indent=2)

    system_prompts = {
        "de": (
            "Du bist ein hochmoderner Cover-Letter-Parser und -Generator. "
            "Ich werde dir ein Anschreiben geben.\n\n"
            "Deine Aufgabe:\n"
            "1. Identifiziere Absender (Name, Anschrift, Telefon, E-Mail).\n"
            "2. Identifiziere Empfänger (Name, Titel/Position, Firma, Anschrift), falls vorhanden.\n"
            "3. Extrahiere Datum, Betreff und ggf. Referenz. (falls vorhanden)\n"
            "4. Extrahiere die Anrede.\n"
            "5. Zerlege den Text des Hauptteils in mehrere Paragraphen, die den Inhalt thematisch gliedern.\n"
            "- **header**: Meta-Informationen aus dem Anschreiben, einschließlich Name und Anschrift des Bewerbers, Telefonnummer, E-Mail-Adresse, Datum, Betreff der Bewerbung sowie der Ansprechpartner (die Person, an die das Schreiben adressiert ist).\n"
            "- **introduction**: Die Einleitung des Anschreibens, welche oft allgemeine Aussagen oder eine generelle Motivation enthält (z. B. zur digitalen Transformation).\n"
            "- **motivation**: Die persönliche Motivation des Bewerbers und der Bezug zur ausgeschriebenen Position.\n"
            "- **experience_summary**: Zusammenfassung der relevanten Berufserfahrung des Bewerbers sowie wichtige berufliche Erfolge.\n"
            "- **company_alignment**: Konkreter Bezug zum Zielunternehmen oder Produkt, auf das sich die Bewerbung bezieht (z. B. Erwähnung eines bestimmten Produkts oder Ziels des Unternehmens und warum der Bewerber dazu passt).\n"
            "- **added_value**: Darstellung des Mehrwerts, den der Bewerber in der neuen Position einzubringen plant.\n"
            "- **salary_expectation**: Angaben zur Gehaltsvorstellung oder zum aktuellen Gehalt des Bewerbers (falls im Anschreiben genannt).\n"
            "- **closing**: Der Abschlusssatz des Anschreibens, inklusive einer Bekundung der Gesprächsbereitschaft oder Dank.\n"
            "- **signature**: Die abschließende Grußformel und der Name des Bewerbers am Ende des Schreibens.\n"
            "6. Gib das Ergebnis in folgender JSON-Struktur zurück:"
            
        ),
        "en": (
            "You are a state-of-the-art cover letter parser and generator. "
            "I will give you a cover letter.\n\n"
            "Your task:\n"
            "1. identify sender (name, address, phone, email).\n"
            "2. identify recipient (name, title/position, company, address), if available.\n"
            "3. extract date, subject and reference if available. (if available)\n"
            "4. extract the salutation.\n"
            "5. divide the text of the main body into several paragraphs that organize the content thematically.\n"
            "- **header**: Meta information from the cover letter, including the applicant's name and address, phone number, email address, date, subject of the application, and the contact person (the person to whom the letter is addressed).\n"
            "- **introduction**: The introduction of the cover letter, which often contains general statements or a general motivation (e.g. on digital transformation).\n"
            "- **motivation**: The personal motivation of the applicant and the reference to the advertised position.\n"
            "- **experience_summary**: Summary of the applicant's relevant professional experience and key professional achievements.\n"
            "- **company_alignment**: Specific reference to the target company or product to which the application relates (e.g. mention a specific product or objective of the company and why the applicant is a good fit).\n"
            "- **added_value**: Presentation of the added value that the applicant plans to bring to the new position.\n"
            "- **salary_expectation**: Details of the applicant's salary expectation or current salary (if mentioned in the cover letter).\n"
            "- **closing**: The closing sentence of the cover letter, including an expression of willingness to interview or thanks.\n"
            "- **signature**: The closing salutation and the applicant's name at the end of the letter.\n"
            "6. return the result in the following JSON structure:"

        ),
        "pl": (
            "Jesteś najnowocześniejszym parserem i generatorem listów motywacyjnych. "
            "Dam ci list motywacyjny."
            "Twoje zadanie: \n"
            "1. zidentyfikować nadawcę (imię i nazwisko, adres, telefon, e-mail).\n"
            "2. zidentyfikować odbiorcę (imię i nazwisko, tytuł/stanowisko, firma, adres), jeśli jest dostępny."
            "3. wyodrębnić datę, temat i odniesienie, jeśli są dostępne. (jeśli dostępne)\n"
            "4. wyodrębnić pozdrowienie.\n"
            "5. podziel tekst głównej części na kilka akapitów, które uporządkują treść tematycznie."
            "- **nagłówek**: metainformacje z listu motywacyjnego, w tym imię i nazwisko oraz adres kandydata, numer telefonu, adres e-mail, data, temat aplikacji i osoba kontaktowa (osoba, do której adresowany jest list).\n"
            "- **wprowadzenie**: Wprowadzenie do listu motywacyjnego, które często zawiera ogólne stwierdzenia lub ogólną motywację (np. dotyczącą transformacji cyfrowej).\n"
            "- **motywacja**: Osobista motywacja kandydata i odniesienie do ogłoszonego stanowiska.\n"
            "- **experience_summary**: Podsumowanie odpowiedniego doświadczenia zawodowego kandydata i kluczowych osiągnięć zawodowych.\n"
            "- **company_alignment**: Konkretne odniesienie do docelowej firmy lub produktu, do którego odnosi się aplikacja (np. wspomnij o konkretnym produkcie lub celu firmy i dlaczego kandydat dobrze pasuje).\n"
            "- **added_value**: Prezentacja wartości dodanej, którą kandydat planuje wnieść na nowe stanowisko.\n"
            "- **salary_expectation**: Szczegóły dotyczące oczekiwanego wynagrodzenia kandydata lub aktualnego wynagrodzenia (jeśli zostało wspomniane w liście motywacyjnym).\n"
            "- **closing**: Zdanie zamykające list motywacyjny, w tym wyrażenie gotowości do rozmowy kwalifikacyjnej lub podziękowanie.\n"
            "- **podpis**: Pozdrowienie końcowe i imię i nazwisko kandydata na końcu listu.\n"
            "6. zwróć wynik w następującej strukturze JSON:"
        ), 
    }

    user_prompts = {
        "en": f"""IMPORTANT:
- All field names (keys) must be in English.
- The contents (values) remain in English.
- Only return a pure JSON object - no Markdown, no code blocks, no comments.
- All main areas must be included - even if they are empty.
- The JSON structure looks like this:
{structure}

Here is the cover letter:
{input_text}
""",
        "de": f"""WICHTIG:
- Alle Feldnamen (keys) müssen auf Englisch sein.
- Die Inhalte (Werte) bleiben auf Deutsch.
- Gib nur ein reines JSON-Objekt zurück – kein Markdown, keine Codeblöcke, keine Kommentare.
- Alle Hauptbereiche müssen enthalten sein – auch wenn sie leer sind.
- Die JSON-Struktur sieht wie folgt aus:
{structure}

Hier ist das Anschreiben:
{input_text}
""",
        "pl": f"""WAŻNE:
- Wszystkie nazwy pól (klucze) muszą być w języku angielskim.
- Zawartość (wartości) pozostaje w języku polskim.
- Zwróć tylko czysty obiekt JSON - bez Markdown, bez bloków kodu, bez komentarzy.
- Wszystkie główne obszary muszą zostać uwzględnione - nawet jeśli są puste.
- Struktura JSON wygląda następująco:
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
