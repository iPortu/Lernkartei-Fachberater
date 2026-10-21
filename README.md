# Lernkartei Fachberater · Ausgabe 2026

Statischer Lerntrainer für die Ausbildung zur Kleingartenfachberatung.

## Inhalt

- 185 bisherige Lernkarten unverändert erhalten, inklusive ihrer bisherigen IDs.
- 26 zusätzliche Fragen **B**, redaktionell aus der übergebenen Vorlage vom 15.10.2026 übernommen und mit überarbeiteten Musterlösungen.
- 26 zusätzliche Fragen **A**, eigenständig aus Themenprofil, Aufgabenformen und Niveau von B abgeleitet. **Nicht die echte Prüfung A.**
- Insgesamt **237 Lernkarten** in neun Themenbereichen.
- Gemischter schriftlicher Satz **2026**: 26 Fragen, je 13 aus A und B, alle neun Bereiche.
- Selbstbewertung: A 83 Punkte, B 85 Punkte, gemischt 2026 87 Punkte. Keine amtlichen Punkteschlüssel oder Bestehensprognose.

Alle neuen Sätze sind Übungsmaterial, keine offizielle Prüfung und keine Vorhersage. Die Übernahme der Vorlage bestätigt nicht deren offiziellen Status.

## Nutzung

`index.html` zusammen mit `trainer-2026-*.js`, `trainer-2026.css` und `assets/` öffnen oder die komplette Struktur über GitHub Pages bereitstellen. Kein Build-Schritt erforderlich.

1. **Lernen:** Grundstock, B, abgeleitetes A oder gemischte 2026-Auswahl filtern.
2. **Prüfung:** schriftlichen Satz auswählen, eigene Antworten notieren und abgeben.
3. Erst dann erscheinen Musterlösungen, Quellen und einzeln ankreuzbare Kriterien. Keine automatische KI-Benotung.
4. Entwürfe werden lokal gespeichert und nach Neuladen wieder aufgenommen. Antworten lassen sich als Text exportieren oder drucken.
5. Die bisherige klassische Zufallsrunde und der Rechentrainer bleiben erhalten.

Der Countdown bleibt unverändert auf **1. März 2027**. Er ist ein Lernziel, kein bestätigter Prüfungstermin.

## Daten und Datenschutz

- Bestehender Fortschritt: `kgfb-progress-v1`, ohne Zurücksetzung.
- Schriftliche Entwürfe: separat `kgfb-written-2026-v1` im Browser-`localStorage`.
- Schriftliche Antworten werden nicht an einen Server oder KI-Dienst gesendet. Auf GitHub Pages bleiben Daten geräte-, browser- und ursprungsgebunden. Eine lokale Vorschau und die öffentliche Domain teilen ihren Speicher nicht.
- Die bestehende optionale Kontosynchronisierung funktioniert nur in einer unterstützenden Claude-Artefaktumgebung, nicht durch GitHub Pages allein.
- Bestehende Google-Fonts-Einbindungen bleiben unverändert und erzeugen externe Fontanfragen. Das neue Logo wird lokal geladen.
- Ursprüngliche DOCX-Datei und persönliche Dokumente werden nicht veröffentlicht.

## Fachliche Redaktion und Logo

Die 52 neuen Datensätze enthalten Quellen- und Herkunftshinweise. Die bisherigen 185 Karten wurden nicht vollständig neu fachlich geprüft. Einzelheiten: [Redaktionshinweise](docs/REDAKTION-2026.md).

Einige Quellen sind datierte Archivkopien; der Stand ist im Quellentitel ausgewiesen. Aus ihnen werden keine aktuellen Pflanzenschutzmittel-Zulassungen abgeleitet. Rechts- und Verbandsfragen sind gegebenenfalls auf Bayern bezogen.

Eigenständiges Logo aus Buch und Keimling: `assets/lerntrainer-logo.svg` (skalierbar und Favicon), `assets/lerntrainer-logo.png` (512 × 512 Pixel).

## Entwicklung

Node.js ab Version 22:

```sh
npm ci
npm test
```

Die Tests prüfen Auswahl, Punkteberechnung, Datenkonsistenz, vollständige A-/B-Sätze und Quellenverweise, Entwurfswiederaufnahme, sichere Textdarstellung, Filter, Logo und unveränderten Grundstock. Keine Modellzugänge erforderlich.

Lokale Vorschau:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```
