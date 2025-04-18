# Changelog


## [2024-03-30] Fix: ID-Referenzierung in Coverletter-Komponenten

### Verbesserungen
- Konsistente Verwendung von `id` statt `_id` in allen Coverletter-Komponenten
- Korrektur der TypeScript-Typen in der API-Definition
- Implementierung von Filterung für ungültige IDs
- Behebung der React Key-Warnung in der Coverletter-Liste

### Technische Details
- Anpassung des `CoverLetter`-Interface in `api.ts`
- Aktualisierung der `CardCoverletter`-Komponente
- Korrektur der ID-Referenzen in der `page.tsx`
- Implementierung von Sicherheitsüberprüfungen für Dokument-IDs

### Status
✅ Implementiert und getestet


## [2024-03-29] - 16:45 Uhr

### Hinzugefügt
- Delete-Endpunkt für Lebensläufe implementiert
  - Neuer DELETE-Endpunkt `/api/v1/resumes/delete/{resume_id}`
  - Benutzer-Berechtigungsprüfung integriert
  - Fehlerbehandlung für nicht gefundene Lebensläufe

### Verbessert
- Frontend-Komponenten optimiert
  - CardResume als separate Komponente ausgelagert
  - Lösch-Button mit Bestätigungsdialog hinzugefügt
  - Verbesserte Fehlerbehandlung im Frontend

### Technisch
- TypeScript-Integration verbessert
- API-Endpunkte konsolidiert
- Sicherheitsvalidierung implementiert

### Commit Message
```
Feature: Resume delete - Implementierung des Delete-Endpunkts für Lebensläufe
```

## [2024-03-29] - 15:30 Uhr

### Verbessert
- Optimierte Lebenslauf-Aktualisierung im Frontend
  - Verbesserte State-Management-Logik für konsistente Datenaktualisierung
  - Automatisches Schließen des Bearbeitungsmodals nach erfolgreicher Aktualisierung
  - Sofortige visuelle Aktualisierung der Kartenansicht

### Technisch
- Implementierung robuster ID-Validierung (_id und id Kompatibilität)
- Verbesserte Fehlerbehandlung mit spezifischen Fehlermeldungen
- Optimierte TypeScript-Integration für bessere Typsicherheit

### Commit Message
```
feat(resume): Verbesserte Lebenslauf-Aktualisierung

- Optimierte State-Management-Logik
- Automatisches Modal-Schließen nach Update
- Verbesserte Fehlerbehandlung und ID-Validierung
- TypeScript-Integration optimiert
```

## [2024-03-29] - 11:45 Uhr

### Verbessert
- Upload und Strukturierungsprozess der Lebensläufe optimiert
  - Verbesserte visuelle Darstellung des Strukturierungsprozesses direkt in den Karten
  - Fortschrittsbalken und Status-Indikatoren für besseres Feedback
  - Seite bleibt während der Strukturierung vollständig bedienbar
  - Sortierung der Lebensläufe nach Erstellungsdatum (neueste zuerst)

### Hinzugefügt
- Neue Status-Visualisierungen:
  - Ladebalken und Spinner für "Wird strukturiert..."
  - Grünes Häkchen für erfolgreich strukturierte Dokumente
  - Rotes X für Fehler bei der Strukturierung
- Verbesserte Button-States:
  - Deaktiviert während der Strukturierung
  - Dynamischer Button-Text basierend auf Status

### Technisch
- Implementierung von asynchroner Dokumentenverarbeitung
- Optimierte Statusverwaltung mit visuellen Indikatoren
- Verbesserte Fehlerbehandlung und Benutzer-Feedback

## [2025-03-29 10:15] - Bugfix: Resume API und ModalEditResume

### Geändert
- Verbesserte Fehlerbehandlung in der Resume-API
- Angepasste URL-Konstruktion für die getById-Methode
- Verbesserte Debug-Informationen im ModalEditResume
- Korrekte Verarbeitung der API-Antwort im ModalEditResume
- Hinzufügung von Fallback-Werten für content und title
- Verbesserte Anzeige der Debug-Informationen im Modal

### Behoben
- 422 Unprocessable Entity Fehler bei der Resume-API
- Fehlende user_id in API-Anfragen
- Falsche Verarbeitung der API-Antwort im ModalEditResume

## [Unreleased]

### Fixed
- Korrektur der MongoDB-Collection-Imports in main.py
- Behebung des Import-Fehlers für count_tokens aus calc.py
- Korrektur der API-Endpunkte für die Dokumentstrukturierung

### Changed
- Optimierung der Dokumentstrukturierung mit korrekten Endpunkten
- Verbesserung der Fehlerbehandlung bei der Token-Zählung

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
- Korrektur der jobdescription-Verarbeitung in der Analyse-Route
- Optimierte Datenbankabfragen für bessere Performance

### Behoben
- Fehler bei der Verarbeitung der strukturierten jobdescription-Daten
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

### Geändert
- Verbesserte Fehlerbehandlung in der ATS-Analyse
- Korrektur der jobdescription-Verarbeitung in der Analyse-Route
- Optimierte Datenbankabfragen für bessere Performance

### Behoben
- Fehler bei der Verarbeitung der strukturierten jobdescription-Daten
- Problem mit der ObjectId-Serialisierung in der Analyse-Response
- Fehlerhafte Parameterübergabe in der ATS-Analyse

### Technische Verbesserungen
- Verbesserte Debug-Ausgaben für bessere Fehlerdiagnose
- Optimierte Datenstruktur für die Analyse-Ergebnisse
- Verbesserte Validierung der Eingabeparameter 