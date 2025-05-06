## Einen Post erstellen
- Öffne den gewünschten Feed (z.B. "aktuelles")
- Schreib das Datum zu Oberst hin und trenne es mit "===" vom nächsten Beitrag
- Jetzt kannst du unter das Datum den Inhalt des Beitrags schreiben.

## Erweiterte Formatierung des Posts
Im Inhalt des Beitrags kannst du Bilder, Links und spezielle Hervorhebungen einfügen.
### Bilder
Um ein Bild einzufügen musst du zuerst das Bild im Ordner "dateien" im feed ablegen. Das wäre zum Beispiel am Ort "js-arcus-webseite/feeds/aktuelles/dateien/mein_bild.jpg".
Sobald du ein Bild abgespeichert hast, kannst du es überall im Blog verwenden.
Das machst du so:
```
01. Januar 2000
Mein Text...
Bild: mein_bild.jpg
Weiter geht's mit mehr Text
===
```
Das Bild wird dann auf der Webseite dargestellt.
### Links
Es gibt verschiedene Arten von Links, welche du verwenden kannst.
Die Informationen des Links sind innerhalb der zwei eckigen Klammern enthalten. Vor dem vertikalen Strich ist die URL oder die Datei, und hinter dem Strich der Text, welcher für den Benutzer sichtbar ist.
#### Datei zum herunterladen
Um einen Link zu einer herunterladbaren Datei zu verwenden, musst du die Datei zuerst einmal in den Dateien ablegen (siehe [[#Bilder]]).
Dannach kannst du die Datei so verlinken:
```
01. Januar 2000
Mein Text...
Du kannst den Flyer [datei:flyer.jpg | hier] herunterladen.
===
```
#### Ein Link auf der Webseite oder sonstwo
Wenn du einen Link auf der Webseite verknüpfen willst, musst du einfach den Teil hinter dem .ch der JS-Arcus-Webseite kopieren und vor dem Strich (|) einfügen.
```
01. Januar 2000
Mein Text...
[leiterteam.html#name_des_neuen_mitglieds | Hier geht's zum neuen Teammitglied]
```
Tipp: Du kannst bei bestimmten Seiten mit einem # angeben, wo auf der Seite der Benutzer landen soll. Das geht auf folgenden Seiten:
- leiterteam.html
Wenn du eine andere Seite verlinken willst dann musst du einfach die ganze URL verwenden (z.B: "https://hitobito.jemk.ch/groups/1/events/90")
```
01. Januar 2000
Mach doch den GS!
Melde dich unter den folgenden Link an: [https://hitobito.jemk.ch/groups/1/events/90 | hitobito.jemk.ch]
```
### Hervorhebungen
Du kannst Texte **fett** oder *kursiv* machen, indem du sie entweder in Sternchen (*) oder zwei Tilden (~) einklammerst.
```
01. Januar 2000
Mein Text...
*Ein fetter Text*
~Ein kursiver Text~
```
