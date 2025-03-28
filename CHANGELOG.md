# Changelog

Alle wichtigen Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/),
und dieses Projekt adhäriert zu [Semantic Versioning](https://semver.org/lang/de/).

## [0.1.3] - 2024-03-28

### Behoben
- Drag & Drop Funktionalität für Word- und PDF-Dateien implementiert
- Port-Konfiguration korrigiert (Frontend: 3002, Backend: 8000)
- API-Endpunkt-Konfiguration in Frontend angepasst

### Technisch
- Frontend-Port in package.json auf 3002 gesetzt
- API_BASE_URL in file-utils.ts auf Port 8000 aktualisiert
- CORS-Konfiguration für die korrekten Ports angepasst

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

## [0.1.0] - 2024-03-21

### Added
- Initiale Version des CV-Managers
- PDF Upload Funktionalität
- Grundlegende Lebenslauf-Verwaltung (Erstellen, Löschen, Auflisten)
- Basis UI mit TailwindCSS und DaisyUI

### Fixed
- CORS-Probleme mit Backend-Endpunkten behoben
- Mehrfache API-Aufrufe beim Laden der Lebensläufe reduziert
- Upload-Status-Handling verbessert

### Pending
- Word-Dokument Upload noch nicht implementiert
- Strukturierung der Lebensläufe nach dem Upload (Prozessschritt erforderlich)
- Analyse-Endpunkt vorhanden, Integration in UI-Flow ausstehend

### Technical Debt
- Typ-Definitionen für API-Responses vervollständigen
- Error-Handling vereinheitlichen
- Loading-States optimieren

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