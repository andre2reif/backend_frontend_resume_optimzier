# Changelog

Alle wichtigen Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/),
und dieses Projekt adhäriert zu [Semantic Versioning](https://semver.org/lang/de/).

## [0.1.2] - 2024-03-27

### Geändert
- Verbesserte Dokumentation der API-Endpunkte
- Klarere Beschreibung der Parameter für ATS-Analyse
- Aktualisierte Beispiel-URLs in der Dokumentation
- Deutsche Übersetzungen für API-Parameter-Beschreibungen

### Hinzugefügt
- Neue Parameter für ATS-Analyse: use_optimized_resume und use_optimized_coverletter
- Detailliertere Dokumentation der Analyse-Funktionalitäten
- Verbesserte Fehlermeldungen und Status-Beschreibungen

### Technisch
- Optimierte Code-Struktur in main.py
- Verbesserte Typisierung der API-Parameter
- Erweiterte Validierung der Eingabeparameter

## [0.1.1] - 2024-03-27

### Geändert
- Verbesserte Fehlerbehandlung in der ATS-Analyse
- Korrektur der JobDescription-Verarbeitung in der Analyse-Route
- Optimierte Datenbankabfragen für bessere Performance

### Behoben
- Fehler bei der Verarbeitung der strukturierten JobDescription-Daten
- Problem mit der ObjectId-Serialisierung in der Analyse-Response
- Fehlerhafte Parameterübergabe in der ATS-Analyse

### Technische Verbesserungen
- Verbesserte Debug-Ausgaben für bessere Fehlerdiagnose
- Optimierte Datenstruktur für die Analyse-Ergebnisse
- Verbesserte Validierung der Eingabeparameter

## [0.1.0] - 2024-03-27

### Verbessert
- **Projektstruktur**: Umfassende Reorganisation des Backend-Codes
  - Aufteilung in modulare Komponenten (core, routers, schemas, utils)
  - Klare Trennung der Verantwortlichkeiten
  - Verbesserte Wartbarkeit und Testbarkeit

- **FastAPI-Integration**:
  - Vereinfachte main.py mit Fokus auf Router-Registrierung
  - Verbesserte API-Dokumentation durch Metadaten
  - Erweiterter Root-Endpunkt mit zusätzlichen Informationen

- **Datenmodellierung**:
  - Einführung von Pydantic-Modellen für alle Schemas
  - Separate Schema-Dateien für bessere Übersichtlichkeit
  - Typsichere Datenvalidierung

- **Konfigurationsmanagement**:
  - Zentralisierte Konfiguration in core/config.py
  - Verbesserte Umgebungsvariablen-Überprüfung
  - Klare Trennung von Konfiguration und Schemas

### Geplant
- **Tests**:
  - Pytest-Konfiguration
  - Router-spezifische Test-Dateien
  - Mock-Daten für Tests

- **Docker-Integration**:
  - Dockerfile für Backend
  - docker-compose.yml für Entwicklung/Produktion
  - .dockerignore

- **CI/CD**:
  - GitHub Actions für automatische Tests
  - Deployment-Pipeline
  - Code-Qualitätsprüfungen (Black, Flake8)

- **Dokumentation**:
  - API-Dokumentation (Swagger)
  - Setup-Anweisungen in README.md
  - Entwickler-Dokumentation 

## [Unreleased]

### Geändert
- Verbesserte Fehlerbehandlung in der ATS-Analyse
- Korrektur der JobDescription-Verarbeitung in der Analyse-Route
- Optimierte Datenbankabfragen für bessere Performance

### Behoben
- Fehler bei der Verarbeitung der strukturierten JobDescription-Daten
- Problem mit der ObjectId-Serialisierung in der Analyse-Response
- Fehlerhafte Parameterübergabe in der ATS-Analyse

### Technische Verbesserungen
- Verbesserte Debug-Ausgaben für bessere Fehlerdiagnose
- Optimierte Datenstruktur für die Analyse-Ergebnisse
- Verbesserte Validierung der Eingabeparameter 