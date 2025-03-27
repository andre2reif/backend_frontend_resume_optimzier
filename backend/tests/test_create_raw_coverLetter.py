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

def insert_test_resume(db):
    test_resume = {
        "userId": ObjectId("fff3a8923a9c3b6e12345678"),
        "rawText": """ 
Per https://career.check24.de/
André Reif
Gallusstr.2 
53227 Bonn
0712 36 66 36 0
andre.reif@gmail.ocm

21. Februar 2025
Ihr Zeichen, Ihre Nachricht vom
-
Bewerbung (Senior) Digital Produktmanager (m/w/d) für ein neues Produkt 

Sehr geehrte Frau Rummel,

Wir leben in einer der größten Transformationsphasen der Menschheit. Alles wird digitaler, vernetzter und intelligenter als je zuvor – Prozesse werden automatisiert, traditionelle Modelle auf den Kopf gestellt und Nutzererwartungen verändern sich rasant. Überleben und erfolgreich sein wird derjenige, der neu denkt, aktiv handelt und Innovation nicht als Option, sondern als Notwendigkeit begreift.

Genau diese Dynamik begeistert mich seit über 26 Jahren. Ich liebe es, digitale Produkte zu entwickeln, bestehende Prozesse zu hinterfragen und datengetriebene Lösungen zu gestalten, die echten Mehrwert für Nutzer schaffen. Deshalb hat mich die Position als (Senior) Digital Produktmanager bei CHECK24 sofort angesprochen.
In meiner Rolle als Senior Product Owner habe ich zahlreiche digitale Produkte erfolgreich entwickelt und skaliert. Bei Chefkoch verantwortete ich das B2C-SaaS-Produkt „Chefkoch PLUS“, steigerte durch datengetriebene Optimierungen die Conversion- und Retention-Raten und verzeichnete eine Verfünffachung der zahlenden Abonnenten. Parallel führte ich KI-gestützte Features ein und optimierte die Sucharchitektur, die heute bis zu 120 Millionen Anfragen monatlich verarbeitet.
Die Steuererklärung zu revolutionieren und mit „SteuerCHECK“ eine intuitive, kundenfreundliche Lösung zu schaffen, ist für mich der logische Schritt, um repetitive und oft unliebsame Aufgaben durch nutzerzentrierte Innovationen zu vereinfachen und sowohl für die Nutzer als auch für CHECK24 einen nachhaltigen Mehrwert zu generieren.



Mein tiefes Verständnis für datenbasierte Produktentwicklung, UX-Optimierung und agile Teamführung möchte ich nutzen, um „SteuerCHECK“ strategisch weiterzuentwickeln und das Kundenerlebnis auf ein neues Level zu heben.
Mein aktuelles Brutto-Jahresgehalt beträgt 98.000 Euro, was meinen Vorstellungen für die ausgeschriebene Position entspricht.
Gerne überzeuge ich Sie in einem persönlichen Gespräch davon, wie ich CHECK24 mit meiner Erfahrung, Innovationskraft und Leidenschaft für digitale Produkte unterstützen kann.
Mit freundlichen GrüßenAndré Reif



___________________
André Reif
""",
        "language": "de",
        "status": "unstructured",
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }

    result = db["coverLetter"].insert_one(test_resume)
    print(f"✅ Cover Letter-Resume eingefügt mit _id: {result.inserted_id}")
    return result.inserted_id

if __name__ == "__main__":
    client = connect_to_db()
    if client:
        db = client["coverletter_db"]
        insert_test_resume(db)
