import os
from pymongo import MongoClient
import certifi
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

def insert_test_job_posting(db):
    test_job_posting = {
        "userId": ObjectId("fff3a8923a9c3b6e12345678"),
        "rawText": """ 
Marketplace Manager für E-Commerce Plattformen - Remote (m/w/d)
Festanstellung

Unternehmens Logo
Growing Imaginations GmbH

Kontaktperson Bild
Sarah Schmiedeknecht
Assistenz der Geschäftsführung
Marketplace Manager für E-Commerce Plattformen - Remote (m/w/d)
Jetzt bewerben
Ohne Anschreiben. In nur 2 Minuten.

Später bewerben




Alle 3 Bilder ansehen
Ab sofort für 24 Monate gesucht
35–40 h pro Woche
Kein Gehalt angegeben
Remote Job
Was erwartet dich?
Du bist verantwortlich für die Betreuung und Weiterentwicklung unserer Marktplatz-Präsenzen auf Amazon, Otto und weiteren Plattformen
Du erstellst, optimierst und pflegst Produktlistings inklusive Content, Bildern und Keywords
Du planst und setzt Verkaufsstrategien, Werbekampagnen (z.B. Amazon PPC) und Promotions um
Du steuerst operativ die Marktplatz-Aktivitäten und überwachst sowie optimierst kontinuierlich die Prozesse
Du entwickelst und führst Kampagnenplanungen durch, inklusive Budgetierung, Zieldefinition und Erfolgskontrolle
Du analysierst relevante KPIs, erstellst Reports und leitest Maßnahmen zur Umsatzsteigerung ab
Du steuerst und optimierst die Lagerbestände, Logistikprozesse und das Retourenmanagement in Zusammenarbeit mit internen Abteilungen
Du beobachtest Markttrends, Wettbewerber und neue Funktionen der Plattformen
Ohne Personalverantwortung

Bereiche
Online-Marketing

Vertrieb & Verkauf

Projektmanagement

Logistik

Datenbanken

Was bieten wir dir?
Einblicke in die spannende Welt eines dynamisch wachsenden E-Commerce-Start-ups mit viel Gestaltungsspielraum
Eine inspirierende Unternehmenskultur geprägt von Innovationsgeist, flachen Hierarchien, direkter Kommunikation und schnellen Entscheidungen
Modernes Arbeiten: Anspruch auf Shared Office Desk, MacBook, flexible Arbeitszeiten sowie Arbeiten aus dem Home Office
Unvergessliche Team-Events, die den Zusammenhalt stärken und für Abwechslung sorgen
Attraktive Mitarbeiterrabatte für dich sowie exklusive Vorteile für Family & Friends
Faire Vergütung

Zusätzliche Urlaubstage

Agiles Arbeiten

Flache Hierarchien

Projektverantwortung

Regelmäßige Feedbackgespräche

Was solltest du mitbringen?
Du hast ein abgeschlossenes Studium im Bereich BWL, Marketing, E-Commerce oder eine vergleichbare Qualifikation
Du hast 2-3 Jahre Erfahrung im Management von Online-Marktplätzen, insbesondere Amazon und Otto
Du bist sicher im Umgang mit Tools wie Amazon Seller Central, Vendor Central und idealerweise OTTO Market
Du verfügst über ausgeprägte analytische Fähigkeiten sowie ein gutes Verständnis für Zahlen und KPIs
Du hast Erfahrung im Umgang mit Performance-Marketing-Tools (z.B. Amazon Ads)
Du bist kommunikationsstark, teamfähig und zeigst ein hohes Maß an Eigeninitiative
Du beherrschst fließend Deutsch und Englisch in Wort und Schrift
2 bis 3 Jahre Berufserfahrung erforderlich

Sprachen
Deutsch

Englisch

Kenntnisse und Fähigkeiten
Amazon-Marktplatz

Vendor Relationship Management

Performance Marketing

Google Ads

Über Growing Imaginations GmbH
Unsere Vision ist es, Kindern langlebige, fantasie-anregende und sinnstiftende Produkte an die Hand zu geben, mit denen sie spielerisch (auf-)wachsen können. Unser erster Schritt dorthin ist unser Spielsofa – eine Produktinnovation aus Spielzeug und Möbelstück.

10-24 Mitarbeiter
Konsumgüter & Nahrungsmittel
Startup
1 - 5 Mio. € Jahresumsatz
""",
        "language": "de",
        "status": "unstructured",
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }

    result = db["jobdescriptions"].insert_one(test_job_posting)
    print(f"✅ Job Posting eingefügt mit _id: {result.inserted_id}")
    return result.inserted_id

if __name__ == "__main__":
    client = connect_to_db()
    if client:
        db = client["jobdescription_db"]  # Datenbankname geändert
        insert_test_job_posting(db)
