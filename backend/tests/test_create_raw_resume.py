import os
import certifi
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")

def connect_to_db():
    try:
        client = MongoClient(
            MONGODB_URI,
            tls=True,
            tlsCAFile=certifi.where(),  # sorgt für gültige SSL-Zertifikate
            serverSelectionTimeoutMS=5000
        )
        client.server_info()  # Verbindungsprüfung
        print("✅ Verbindung zur MongoDB erfolgreich.")
        return client
    except Exception as e:
        print("❌ Verbindung fehlgeschlagen:", e)
        return None

def insert_test_resume(db):
    test_resume = {
        "userId": ObjectId("fff3a8923a9c3b6e12345678"),
        "rawText": """ Mobil: +49 172 36 66 36 0 E-Mail: andre.reif@gmail.com Geboren am: 16. November 1978 Verheiratet, Tochter (6), Sohn (1)
Mehr als Mehr als Mehr als Genau Mit Stolz 26 150 9 7 3
    Jahre Berufserfahrung im Digitalen Umfeld
Summary
Personal Statement
Berufliche Referenzen (Auszug)
Online Projekte iOS-/ Android-Apps Patente in Bereich Awards verliehen konzipiert und vertestet Technologie und Food bekommen
- 26 Jahre Erfahrung in der digitalen Produktentwicklung, davon 11 Jahre als Product Owner / Product Manager - SaaS-/E-Commerce-Expertise seit über 10 Jahren
- AI-/ML-Erfahrung (seit 2014 Machine Learning, seit 2022 verstärkt Fokus auf KI)
- Agile Leadership, exzellentes Stakeholder-Management, ausgeprägte Daten- und Kundenorientierung
- Langjährige Praxis in dynamischen (Startup-)Umfeldern sowie in Konzernstrukturen
Ich bin Ideengeber, kreativ und lösungsorientiert und blicke auf 26 Jahre Erfahrung als einer der „digitalen Experten der ersten Stunde“ zurück. Dank schneller Auffassungsgabe und analytischer Stärke erkenne ich komplexe Zusammenhänge sofort. Ich liebe es, Produkte zu entwickeln, zu skalieren und nachhaltig erfolgreich zu machen. Datengetriebenes Arbeiten ist für mich selbstverständlich;
ich begeistere mich für neueste Technologien und nehme mein Umfeld gern mit auf die Reise.
1. „Herr Reif verfügt über fundierte und vielseitige Fachkenntnisse und eine große Berufserfahrung. Er beherrscht seinen Arbeitsbereich umfassend und überdurchschnittlich.
Er zeichnet sich durch eine sehr schnelle Auffassungsgabe aus und findet auch in schwierigen Situationen jederzeit gute Lösungen.“ (derzeitiger Arbeitgeber)
2. „Neben seinen hohen fachlichen Kenntnissen ist besonders sein starkes Engagement, Lösungen zu schaffen, hervorzuheben.“ (Geschäftsleitung Verlagswesen)
3. „Herr Reif untersuchte unsere Lösungen für einen neuen Geschäftsbereich und kombinierte diese mit seinen Erfahrungen. So entstand ein Produkt, mit dem wir zu Beginn nicht gerechnet hatten.
Diese Lösung hat uns den Eintritt in einen komplett neuen Geschäftsbereich ermöglicht, der uns weitere Chancen zur Wertschöpfung eröffnet.“ (Strategischer Business Owner)
4. „Herr Reif analysierte unsere verschiedenen Marketing-Kanäle und schuf in unserem Unternehmen das Bewusstsein für eine integrierte Multi-Channel-Strategie. Dabei erhielten die Kanäle Mobile und
Social Media neben den ERP-Daten eine höhere Priorität. Visionäres Denken, stets lösungsorientiert und seine agile Arbeitsweise machten die Zusammenarbeit mit ihm als Berater erfrischend.
Ein erfrischender Berater seiner Zunft, die ansonsten oft nur trocken analysiert und Halbwissen verbreitet.“
(Unit-Leiter Retail)
      
   Beruflicher Werdegang
Mobil: +49 172 36 66 36 0 E-Mail: andre.reif@gmail.com Geboren am: 16. November 1978 Verheiratet, Tochter (6), Sohn (1)
Senior Product Manager / Product Owner – Chefkoch (2017 – heute)
Schwerpunkte:
Chefkoch PLUS (B2C-SaaS):
- Fachliche Verantwortung, Entwicklung und Weiterentwicklung des Chefkoch PLUS-Produkts
- Fokus auf Conversion im Checkout pro Kampagne/Kanal/Kommunikation, Retentionsteigerung,
A/B-Tests, Weiterentwicklung
- Rententionsteigerung und Churn-Prevention sowie Steigerung der Produkt-Attraktivität
- Steuerung der wichtigsten KPIs, mit direkter Auswirkung auf die nächsten/folgende Schritte
- Nutzung von Erkenntnissen aus Kano-Umfragen, qualitativen User-Labs, datengetriebenem
Arbeiten und ständigem Auswerten von Supportanfragen zur Entscheidungsfindung
- Stakeholder-Management mit 9 unterschiedlichen Stakeholdern
- Konzeption von KI-Features für Chefkoch PLUS-Nutzer
Konzept und Neuentwicklung der Suche:
- ML/AI-Projekte: Algolia, AI-Reranking, Nutzung von Nutzersignalen (CTR, Conversions), Suchoptimierung, Personalisierung, Profiling, „digital twins“ in der Suche
- Skalierung: bis zu 120 Mio. Requests/Monat
- Konzept und Umsetzung der strategischen Initiative „Smart Assistant“ inkl. Preferred Partnership
- Stakeholder-Management mit internationalen Partnern (Samsung, Google, Amazon, Lenovo)
Agile Methoden & Tools:
- Tiefgehende SCRUM-Erfahrung
- Jira, Confluence, Miro
Erfolge/Highlights:
- Verantwortung für 6-stellige zahlende PLUS-Nutzer
- Steigerung der wiederkehrenden Nutzung um 30 % (binnen 1 Jahr)
- Steigerung der PLUS-Abonnenten um das 6-Fache (binnen 1,5 Jahren)
- Steigerung der neuen PLUS-Abonnenten um 15 % (2024)
- Reduktion der Churn-Rate von 70 % auf 40 % (Benchmark: 50 bis 60 %)
- Steigerung der Conversion im Checkout (Zahlung/Funnelstart) um 233 % (2024)
- Neue Sucharchitektur: Reduktion der Errors von 3000 täglich auf 23 pro Monat
- Verantwortung für monatlich 12 Mio. suchende Nutzer bei 120 Mio. Suchanfragen
- Steigerung der Sichtbarkeit der Suche von 59 auf 160 binnen 2 Jahren
- MVP-Phase: Launch von 2 Apps in 2 Wochen (hohe Umsetzungsgeschwindigkeit)
Aeroscan GmbH (2016–2017)
- Marketing- und Produktmanager Digital Health-Services
- Fokus auf Transformation von B2B zu B2C
Weitere Gründungen / Beratungen (2007–2017)
- Gründungen: Quenturio Consulting GmbH, MyMobai GmbH, Diety UG
- Fokus: Mobile, E-Commerce, Marketing, Innovationsprojekte
- Kunden: PayPal (EMEA), Vodafone Group (UK), VoucherCloud (Bristol)
Frühe Laufbahn (1997–2013)
- Freelancer 1997 bis 2000, Erste Gründung (Mindbox GmbH 2000) - Schwerpunkt: Digital-Agentur

   Key Skills
Mobil: +49 172 36 66 36 0 E-Mail: andre.reif@gmail.com Geboren am: 16. November 1978 Verheiratet, Tochter (6), Sohn (1)
Produktmanagement / Agiles Arbeiten
- Roadmap, KPI, A/B-Tests
- Agiles Projektmanagement/SCRUM: Beherrschen und Nutzen aller SCRUM-Events und -Rituale,
Etablieren der Priorisierungsmethode RICE
- Aktive Mitarbeit bei der Rollendefinition der agilen Rollen nach POEM (Product Ownership Evolution Model)
- Treiber nutzerzentrierter und datenbasierter Produktentwicklungen
- Sparringspartner für die Definition und Verfolgung der richtigen KPIs
- Entwicklung zum wichtigen Ansprechpartner für Markt, Daten und Produkt
- Teamübergreifende Priorisierung von Quartalsthemen
- Etablierung und maßgebliche Mitentwicklung der Quartalsplanung als Instrument
- Durchführung von Design Sprints / Hackathons zur schnellen Lösungsfindung
- Schnelle Experimente und A/B-Tests zur raschen Einholung von Nutzerfeedback
- Mitgestaltung von Teamschnitten und Entwicklung von Kontexten für geschäftsmodellorientierte
Journey-Teams
SaaS-/E-Commerce
- B2C-Subscriptions inkl. aller Phasen (Try out, Conversion, Onboarding, Retention, Churn)
- Einführung und vertesten zahlreicher Zahlungsmethoden
- CRM Maßnahmen zur Rückgewinnung
Stakeholder-Management & Teamführung
- Management von 9 unterschiedlichen Stakeholdern
- Manangement von externen Partnern (Google, Amazon, Lenovo, Samsung)
- Einführung von Lerntagen innerhalb des Teams zur stetigen Weiterentwicklung)
Unternehmerisches Denken:
- Initiator des Nordsterns „Spotify der Rezepte“
- Entscheidungsfindung unter der Prämisse „Würde ich mein eigenes Geld investieren?“
- Forderung und Etablierung einer zahlengetriebenen Produktentwicklung („Pure Data vs. Meinung“)

   Fokus KI-/ML-Projekte
Mobil: +49 172 36 66 36 0 E-Mail: andre.reif@gmail.com Geboren am: 16. November 1978 Verheiratet, Tochter (6), Sohn (1)
- 2014 Machine Learning: Rezeptdaten
- 2018 Tokenisierung und Sprachvereinfachung in User generated Content
- 2021 Selbststudium von Python
- 2022 ChatGPT Nutzer der ersten Stunde, seitdem stetiges Optimieren der Prompt Engineering Skills - 2023 Eigener CustomGPTs für die alltägliche Erleichterung
- 2024 Nutzung von APIs zur Bildgenerierung, Batch-Verarbeitung von 100.000 Prompts
- 2025 RAG und AI Agents
- Tools/Dienste/Plattformen, die ich bereits nutze:Hugging Face, Google Gemini, OpenAI,
OpenAI API, Bolt.new, Flux, Ideogram, Fal.ai, Perplexiy, n8n, make.com, realtime-APIs,
Google NotebookLM, Bolt.New
- Evaluiere privat gerade: thundercompute
Durch persönliches Engagement im KI-Bereich bringe ich ein tiefes Verständnis für aktuelle KI-Technologien mit und kann dieses zwischen Stakeholdern, Dev-Teams und UX einbringen.
- Evaluierung und Einführung von Salesforce (2020) - Evaluierung und Einführung von Algolia (2021)
- Nutzen von Stripe (seit 2022)
- Nutzen von RevenueCat (seit 2022)
- Evaluierung von Airship (2024/2025)
- Evaluierung und Einführung von Learnworlds (2024)
- Jira, Confluence, Miro
▪ Abschluss Hochschulreife (Juni 1997)
▪ Deutsch (Muttersprache, C2)
▪ English (C1)
  SAAS Applications
Agile Tools
Schulbildung Sprachen
""",
        "language": "de",
        "status": "unstructured",
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }

    result = db["resumes"].insert_one(test_resume)
    print(f"✅ Test-Resume eingefügt mit _id: {result.inserted_id}")
    return result.inserted_id

if __name__ == "__main__":
    client = connect_to_db()
    if client:
        db = client["resume_db"]
        insert_test_resume(db)
