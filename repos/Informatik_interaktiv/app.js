// ==================== DATA STRUCTURES ====================

const LEVELS_DATA = {
    html: [
        {
            id: 'html-1',
            number: '1.1',
            title: 'HTML Basics - Erste Webseite erstellen',
            description: 'Erstelle deine erste HTML-Seite mit einem Titel und einem Absatz',
            difficulty: 'easy',
            task: 'Erstelle eine HTML-Seite mit einem h1-Titel "Hallo Welt" und einem Absatz mit beliebigem Text.',
            starterCode: '<!DOCTYPE html>\n<html>\n<head>\n    <title>Meine erste Webseite</title>\n</head>\n<body>\n    <!-- Dein Code hier -->\n</body>\n</html>',
            solution: '<!DOCTYPE html>\n<html>\n<head>\n    <title>Meine erste Webseite</title>\n</head>\n<body>\n    <h1>Hallo Welt</h1>\n    <p>Das ist meine erste Webseite!</p>\n</body>\n</html>',
            hints: [
                'Verwende das <h1> Tag für die Überschrift',
                'Verwende das <p> Tag für den Absatz',
                'Platziere beide Elemente innerhalb des <body> Tags'
            ],
            validation: (code) => {
                return code.includes('<h1>') && code.includes('</h1>') &&
                       code.includes('<p>') && code.includes('</p>');
            }
        },
        {
            id: 'html-2',
            number: '1.2',
            title: 'HTML Text-Formatierung',
            description: 'Lerne verschiedene Text-Formatierungen kennen',
            difficulty: 'easy',
            task: 'Erstelle eine Seite mit normalem Text, fettem Text (<strong>) und kursivem Text (<em>).',
            starterCode: '<!DOCTYPE html>\n<html>\n<body>\n    <!-- Dein Code hier -->\n</body>\n</html>',
            solution: '<!DOCTYPE html>\n<html>\n<body>\n    <p>Normaler Text</p>\n    <p><strong>Fetter Text</strong></p>\n    <p><em>Kursiver Text</em></p>\n</body>\n</html>',
            hints: [
                'Nutze <strong> für fetten Text',
                'Nutze <em> für kursiven Text',
                'Du kannst mehrere Absätze verwenden'
            ],
            validation: (code) => {
                return code.includes('<strong>') && code.includes('<em>');
            }
        },
        {
            id: 'html-3',
            number: '1.3',
            title: 'HTML Listen & Links - Strukturierung',
            description: 'Erstelle Listen und füge Links hinzu',
            difficulty: 'medium',
            task: 'Erstelle eine ungeordnete Liste mit 3 Hobbys und füge einen Link zu Wikipedia hinzu.',
            starterCode: '<!DOCTYPE html>\n<html>\n<body>\n    <h2>Meine Hobbys</h2>\n    <!-- Liste hier -->\n    \n    <!-- Link hier -->\n</body>\n</html>',
            solution: '<!DOCTYPE html>\n<html>\n<body>\n    <h2>Meine Hobbys</h2>\n    <ul>\n        <li>Programmieren</li>\n        <li>Lesen</li>\n        <li>Sport</li>\n    </ul>\n    <a href="https://de.wikipedia.org">Wikipedia besuchen</a>\n</body>\n</html>',
            hints: [
                'Verwende <ul> für eine ungeordnete Liste',
                'Jedes Listen-Element nutzt <li>',
                'Links werden mit <a href="..."> erstellt'
            ],
            validation: (code) => {
                return code.includes('<ul>') && code.includes('<li>') && code.includes('<a href');
            }
        },
        {
            id: 'html-4',
            number: '1.4',
            title: 'HTML Bilder einfügen',
            description: 'Lerne wie man Bilder in HTML einbindet',
            difficulty: 'easy',
            task: 'Füge ein Bild mit alt-Text ein.',
            starterCode: '<!DOCTYPE html>\n<html>\n<body>\n    <h1>Mein Bild</h1>\n    <!-- Bild hier einfügen -->\n</body>\n</html>',
            solution: '<!DOCTYPE html>\n<html>\n<body>\n    <h1>Mein Bild</h1>\n    <img src="https://via.placeholder.com/300" alt="Beispielbild">\n</body>\n</html>',
            hints: [
                'Verwende das <img> Tag',
                'Das src-Attribut gibt die Bild-URL an',
                'Das alt-Attribut beschreibt das Bild'
            ],
            validation: (code) => {
                return code.includes('<img') && code.includes('src=') && code.includes('alt=');
            }
        },
        {
            id: 'html-5',
            number: '1.5',
            title: 'HTML Tabellen erstellen',
            description: 'Erstelle eine einfache Tabelle',
            difficulty: 'medium',
            task: 'Erstelle eine Tabelle mit 2 Zeilen und 2 Spalten (Name und Alter).',
            starterCode: '<!DOCTYPE html>\n<html>\n<body>\n    <table border="1">\n        <!-- Dein Code hier -->\n    </table>\n</body>\n</html>',
            solution: '<!DOCTYPE html>\n<html>\n<body>\n    <table border="1">\n        <tr>\n            <th>Name</th>\n            <th>Alter</th>\n        </tr>\n        <tr>\n            <td>Max</td>\n            <td>15</td>\n        </tr>\n    </table>\n</body>\n</html>',
            hints: [
                'Verwende <tr> für Tabellenzeilen',
                'Verwende <th> für Überschriften',
                'Verwende <td> für Datenzellen'
            ],
            validation: (code) => {
                return code.includes('<tr>') && code.includes('<td>');
            }
        },
        {
            id: 'html-6',
            number: '1.6',
            title: 'HTML Formulare - Interaktive Elemente',
            description: 'Erstelle ein einfaches Formular',
            difficulty: 'medium',
            task: 'Erstelle ein Formular mit einem Textfeld für den Namen und einem Submit-Button.',
            starterCode: '<!DOCTYPE html>\n<html>\n<body>\n    <form>\n        <!-- Dein Code hier -->\n    </form>\n</body>\n</html>',
            solution: '<!DOCTYPE html>\n<html>\n<body>\n    <form>\n        <label for="name">Name:</label>\n        <input type="text" id="name" name="name">\n        <button type="submit">Absenden</button>\n    </form>\n</body>\n</html>',
            hints: [
                'Verwende <input type="text"> für Textfelder',
                'Verwende <label> für Beschriftungen',
                'Verwende <button type="submit"> für den Submit-Button'
            ],
            validation: (code) => {
                return code.includes('<form>') && code.includes('<input') && code.includes('type="text"');
            }
        },
        {
            id: 'html-7',
            number: '1.7',
            title: 'HTML Semantische Tags',
            description: 'Nutze semantische HTML5-Elemente',
            difficulty: 'hard',
            task: 'Erstelle eine Seite mit <header>, <main>, <article> und <footer>.',
            starterCode: '<!DOCTYPE html>\n<html>\n<body>\n    <!-- Dein Code hier -->\n</body>\n</html>',
            solution: '<!DOCTYPE html>\n<html>\n<body>\n    <header>\n        <h1>Meine Website</h1>\n    </header>\n    <main>\n        <article>\n            <h2>Artikel-Titel</h2>\n            <p>Artikel-Inhalt</p>\n        </article>\n    </main>\n    <footer>\n        <p>Copyright 2025</p>\n    </footer>\n</body>\n</html>',
            hints: [
                '<header> für den Kopfbereich',
                '<main> für den Hauptinhalt',
                '<footer> für den Fußbereich'
            ],
            validation: (code) => {
                return code.includes('<header>') && code.includes('<main>') && code.includes('<footer>');
            }
        }
    ],
    css: [
        {
            id: 'css-1',
            number: '2.1',
            title: 'CSS Styling - Farben und Schriftarten',
            description: 'Lerne CSS-Grundlagen für Text-Styling',
            difficulty: 'easy',
            task: 'Style einen Absatz mit roter Farbe und einer Schriftgröße von 20px.',
            starterCode: '<!DOCTYPE html>\n<html>\n<head>\n<style>\n    /* Dein CSS hier */\n</style>\n</head>\n<body>\n    <p>Dieser Text soll gestylt werden!</p>\n</body>\n</html>',
            solution: '<!DOCTYPE html>\n<html>\n<head>\n<style>\n    p {\n        color: red;\n        font-size: 20px;\n    }\n</style>\n</head>\n<body>\n    <p>Dieser Text soll gestylt werden!</p>\n</body>\n</html>',
            hints: [
                'Verwende color: red; für rote Schrift',
                'Verwende font-size: 20px; für die Größe',
                'CSS-Regeln stehen in geschweiften Klammern {}'
            ],
            validation: (code) => {
                return code.includes('color:') && code.includes('font-size:');
            }
        },
        {
            id: 'css-2',
            number: '2.2',
            title: 'CSS Klassen und IDs',
            description: 'Nutze Klassen und IDs zum Stylen',
            difficulty: 'easy',
            task: 'Erstelle eine Klasse .highlight mit gelbem Hintergrund und eine ID #title mit blauer Farbe.',
            starterCode: '<!DOCTYPE html>\n<html>\n<head>\n<style>\n    /* Dein CSS hier */\n</style>\n</head>\n<body>\n    <h1 id="title">Titel</h1>\n    <p class="highlight">Hervorgehobener Text</p>\n</body>\n</html>',
            solution: '<!DOCTYPE html>\n<html>\n<head>\n<style>\n    #title {\n        color: blue;\n    }\n    .highlight {\n        background-color: yellow;\n    }\n</style>\n</head>\n<body>\n    <h1 id="title">Titel</h1>\n    <p class="highlight">Hervorgehobener Text</p>\n</body>\n</html>',
            hints: [
                'IDs werden mit # selektiert: #title',
                'Klassen werden mit . selektiert: .highlight',
                'background-color setzt die Hintergrundfarbe'
            ],
            validation: (code) => {
                return code.includes('#title') && code.includes('.highlight') && code.includes('background-color');
            }
        },
        {
            id: 'css-3',
            number: '2.3',
            title: 'CSS Box-Model - Layout-Grundlagen',
            description: 'Verstehe Margin, Padding und Border',
            difficulty: 'medium',
            task: 'Erstelle ein div mit 20px Padding, 10px Margin und einem schwarzen Border.',
            starterCode: '<!DOCTYPE html>\n<html>\n<head>\n<style>\n    .box {\n        /* Dein CSS hier */\n    }\n</style>\n</head>\n<body>\n    <div class="box">Box-Inhalt</div>\n</body>\n</html>',
            solution: '<!DOCTYPE html>\n<html>\n<head>\n<style>\n    .box {\n        padding: 20px;\n        margin: 10px;\n        border: 2px solid black;\n    }\n</style>\n</head>\n<body>\n    <div class="box">Box-Inhalt</div>\n</body>\n</html>',
            hints: [
                'padding: 20px; für Innenabstand',
                'margin: 10px; für Außenabstand',
                'border: 2px solid black; für den Rahmen'
            ],
            validation: (code) => {
                return code.includes('padding:') && code.includes('margin:') && code.includes('border:');
            }
        },
        {
            id: 'css-4',
            number: '2.4',
            title: 'CSS Hintergrundbilder',
            description: 'Füge Hintergrundbilder hinzu',
            difficulty: 'easy',
            task: 'Setze ein Hintergrundbild für ein div-Element.',
            starterCode: '<!DOCTYPE html>\n<html>\n<head>\n<style>\n    .bg-box {\n        width: 300px;\n        height: 200px;\n        /* Dein CSS hier */\n    }\n</style>\n</head>\n<body>\n    <div class="bg-box">Mit Hintergrund</div>\n</body>\n</html>',
            solution: '<!DOCTYPE html>\n<html>\n<head>\n<style>\n    .bg-box {\n        width: 300px;\n        height: 200px;\n        background-image: url("https://via.placeholder.com/300");\n        background-size: cover;\n    }\n</style>\n</head>\n<body>\n    <div class="bg-box">Mit Hintergrund</div>\n</body>\n</html>',
            hints: [
                'Verwende background-image: url("...")\\;',
                'background-size: cover; passt das Bild an',
                'Eine URL kann https://via.placeholder.com/300 sein'
            ],
            validation: (code) => {
                return code.includes('background-image:');
            }
        },
        {
            id: 'css-5',
            number: '2.5',
            title: 'CSS Text-Ausrichtung',
            description: 'Richte Text aus',
            difficulty: 'easy',
            task: 'Zentriere einen Text horizontal.',
            starterCode: '<!DOCTYPE html>\n<html>\n<head>\n<style>\n    .centered {\n        /* Dein CSS hier */\n    }\n</style>\n</head>\n<body>\n    <p class="centered">Zentrierter Text</p>\n</body>\n</html>',
            solution: '<!DOCTYPE html>\n<html>\n<head>\n<style>\n    .centered {\n        text-align: center;\n    }\n</style>\n</head>\n<body>\n    <p class="centered">Zentrierter Text</p>\n</body>\n</html>',
            hints: [
                'Verwende text-align: center;',
                'Dies funktioniert für Inline- und Block-Elemente',
                'Andere Optionen: left, right, justify'
            ],
            validation: (code) => {
                return code.includes('text-align:');
            }
        },
        {
            id: 'css-6',
            number: '2.6',
            title: 'CSS Flexbox - Moderne Layouts',
            description: 'Nutze Flexbox für flexible Layouts',
            difficulty: 'hard',
            task: 'Erstelle einen Flex-Container mit 3 Items, die gleichmäßig verteilt sind.',
            starterCode: '<!DOCTYPE html>\n<html>\n<head>\n<style>\n    .container {\n        /* Dein CSS hier */\n    }\n    .item {\n        background-color: lightblue;\n        padding: 20px;\n        margin: 5px;\n    }\n</style>\n</head>\n<body>\n    <div class="container">\n        <div class="item">Item 1</div>\n        <div class="item">Item 2</div>\n        <div class="item">Item 3</div>\n    </div>\n</body>\n</html>',
            solution: '<!DOCTYPE html>\n<html>\n<head>\n<style>\n    .container {\n        display: flex;\n        justify-content: space-around;\n    }\n    .item {\n        background-color: lightblue;\n        padding: 20px;\n        margin: 5px;\n    }\n</style>\n</head>\n<body>\n    <div class="container">\n        <div class="item">Item 1</div>\n        <div class="item">Item 2</div>\n        <div class="item">Item 3</div>\n    </div>\n</body>\n</html>',
            hints: [
                'Verwende display: flex; auf dem Container',
                'justify-content: space-around; verteilt die Items',
                'Andere Optionen: space-between, center, flex-start'
            ],
            validation: (code) => {
                return code.includes('display: flex') && code.includes('justify-content');
            }
        },
        {
            id: 'css-7',
            number: '2.7',
            title: 'CSS Hover-Effekte',
            description: 'Erstelle interaktive Hover-Effekte',
            difficulty: 'medium',
            task: 'Erstelle einen Button, der bei Hover die Farbe ändert.',
            starterCode: '<!DOCTYPE html>\n<html>\n<head>\n<style>\n    .button {\n        background-color: blue;\n        color: white;\n        padding: 10px 20px;\n        border: none;\n    }\n    /* Hover-Effekt hier */\n</style>\n</head>\n<body>\n    <button class="button">Hover mich!</button>\n</body>\n</html>',
            solution: '<!DOCTYPE html>\n<html>\n<head>\n<style>\n    .button {\n        background-color: blue;\n        color: white;\n        padding: 10px 20px;\n        border: none;\n    }\n    .button:hover {\n        background-color: darkblue;\n        cursor: pointer;\n    }\n</style>\n</head>\n<body>\n    <button class="button">Hover mich!</button>\n</body>\n</html>',
            hints: [
                'Verwende :hover Pseudo-Klasse',
                'Die Syntax ist .button:hover { ... }',
                'Ändere background-color bei Hover'
            ],
            validation: (code) => {
                return code.includes(':hover');
            }
        }
    ],
    python: [
        {
            id: 'python-1',
            number: '3.1',
            title: 'Python Variablen - Ausgabe und Variablen',
            description: 'Lerne Variablen und print() kennen',
            difficulty: 'easy',
            task: 'Erstelle eine Variable mit deinem Namen und gib sie mit print() aus.',
            starterCode: '# Erstelle eine Variable und gib sie aus\n',
            solution: 'name = "Max"\nprint(name)',
            hints: [
                'Variablen werden mit = zugewiesen: name = "..."',
                'Verwende print() um Variablen auszugeben',
                'Strings stehen in Anführungszeichen'
            ],
            validation: (code) => {
                return code.includes('print(') && code.includes('=');
            }
        },
        {
            id: 'python-2',
            number: '3.2',
            title: 'Python Rechnen mit Zahlen',
            description: 'Nutze Python als Taschenrechner',
            difficulty: 'easy',
            task: 'Berechne 15 + 27 und speichere das Ergebnis in einer Variable. Gib das Ergebnis aus.',
            starterCode: '# Berechne und gib das Ergebnis aus\n',
            solution: 'ergebnis = 15 + 27\nprint(ergebnis)',
            hints: [
                'Python kann rechnen: +, -, *, /',
                'Speichere das Ergebnis in einer Variable',
                'Gib die Variable mit print() aus'
            ],
            validation: (code) => {
                return code.includes('+') && code.includes('print(');
            }
        },
        {
            id: 'python-3',
            number: '3.3',
            title: 'Python Bedingungen - if-else Logik',
            description: 'Lerne bedingte Anweisungen',
            difficulty: 'medium',
            task: 'Schreibe ein Programm: Wenn eine Zahl größer als 10 ist, gib "Groß" aus, sonst "Klein".',
            starterCode: 'zahl = 15\n# Dein Code hier\n',
            solution: 'zahl = 15\nif zahl > 10:\n    print("Groß")\nelse:\n    print("Klein")',
            hints: [
                'Verwende if zahl > 10:',
                'Vergiss nicht die Einrückung (4 Leerzeichen)',
                'else: für den anderen Fall'
            ],
            validation: (code) => {
                return code.includes('if') && code.includes('else');
            }
        },
        {
            id: 'python-4',
            number: '3.4',
            title: 'Python Listen erstellen',
            description: 'Arbeite mit Listen',
            difficulty: 'easy',
            task: 'Erstelle eine Liste mit 3 Früchten und gib sie aus.',
            starterCode: '# Erstelle eine Liste und gib sie aus\n',
            solution: 'fruechte = ["Apfel", "Banane", "Orange"]\nprint(fruechte)',
            hints: [
                'Listen werden mit eckigen Klammern erstellt: [...]',
                'Elemente werden mit Komma getrennt',
                'Strings in Listen brauchen Anführungszeichen'
            ],
            validation: (code) => {
                return code.includes('[') && code.includes(']') && code.includes('print(');
            }
        },
        {
            id: 'python-5',
            number: '3.5',
            title: 'Python Schleifen - for-Loops',
            description: 'Wiederhole Code mit Schleifen',
            difficulty: 'medium',
            task: 'Schreibe eine for-Schleife, die die Zahlen 1 bis 5 ausgibt.',
            starterCode: '# Dein Code hier\n',
            solution: 'for i in range(1, 6):\n    print(i)',
            hints: [
                'Verwende for i in range(...):',
                'range(1, 6) erzeugt Zahlen von 1 bis 5',
                'Vergiss nicht die Einrückung'
            ],
            validation: (code) => {
                return code.includes('for') && code.includes('range(');
            }
        },
        {
            id: 'python-6',
            number: '3.6',
            title: 'Python Listen durchlaufen',
            description: 'Iteriere über Listen',
            difficulty: 'medium',
            task: 'Durchlaufe eine Liste von Namen und gib jeden Namen aus.',
            starterCode: 'namen = ["Anna", "Ben", "Clara"]\n# Dein Code hier\n',
            solution: 'namen = ["Anna", "Ben", "Clara"]\nfor name in namen:\n    print(name)',
            hints: [
                'Verwende for name in namen:',
                'Die Variable name nimmt jeden Wert der Liste an',
                'Gib name mit print() aus'
            ],
            validation: (code) => {
                return code.includes('for') && code.includes('in') && code.includes('print(');
            }
        },
        {
            id: 'python-7',
            number: '3.7',
            title: 'Python Funktionen - Wiederverwendbarer Code',
            description: 'Erstelle eigene Funktionen',
            difficulty: 'hard',
            task: 'Schreibe eine Funktion gruss(), die "Hallo!" ausgibt. Rufe sie auf.',
            starterCode: '# Definiere die Funktion und rufe sie auf\n',
            solution: 'def gruss():\n    print("Hallo!")\n\ngruss()',
            hints: [
                'Funktionen werden mit def definiert',
                'Syntax: def funktionsname():',
                'Rufe die Funktion mit funktionsname() auf'
            ],
            validation: (code) => {
                return code.includes('def ') && code.includes('print(');
            }
        },
        {
            id: 'python-8',
            number: '3.8',
            title: 'Python Funktionen mit Parametern',
            description: 'Übergebe Werte an Funktionen',
            difficulty: 'hard',
            task: 'Schreibe eine Funktion addiere(a, b), die zwei Zahlen addiert und das Ergebnis zurückgibt.',
            starterCode: '# Definiere die Funktion\n\n# Teste sie\nprint(addiere(5, 3))\n',
            solution: 'def addiere(a, b):\n    return a + b\n\nprint(addiere(5, 3))',
            hints: [
                'Parameter stehen in Klammern: def addiere(a, b):',
                'Verwende return um einen Wert zurückzugeben',
                'Die Funktion kann dann mit addiere(5, 3) aufgerufen werden'
            ],
            validation: (code) => {
                return code.includes('def ') && code.includes('return');
            }
        },
        {
            id: 'python-9',
            number: '3.9',
            title: 'Python While-Schleifen',
            description: 'Nutze while-Schleifen',
            difficulty: 'medium',
            task: 'Schreibe eine while-Schleife, die von 1 bis 3 zählt.',
            starterCode: '# Dein Code hier\n',
            solution: 'i = 1\nwhile i <= 3:\n    print(i)\n    i = i + 1',
            hints: [
                'while Bedingung: führt den Code aus solange die Bedingung wahr ist',
                'Initialisiere eine Variable vor der Schleife',
                'Vergiss nicht die Variable zu erhöhen (i = i + 1)'
            ],
            validation: (code) => {
                return code.includes('while');
            }
        },
        {
            id: 'python-10',
            number: '3.10',
            title: 'Python Dictionaries',
            description: 'Arbeite mit Dictionaries (Wörterbüchern)',
            difficulty: 'hard',
            task: 'Erstelle ein Dictionary mit Schlüssel-Wert-Paaren und gib einen Wert aus.',
            starterCode: '# Erstelle ein Dictionary\n',
            solution: 'person = {"name": "Max", "alter": 15}\nprint(person["name"])',
            hints: [
                'Dictionaries nutzen geschweifte Klammern: {}',
                'Format: {"schlüssel": "wert"}',
                'Zugriff mit dictionary["schlüssel"]'
            ],
            validation: (code) => {
                return code.includes('{') && code.includes('}') && code.includes(':');
            }
        }
    ],
    sql: [
        {
            id: 'sql-1',
            number: '4.1',
            title: 'SQL Basics - SELECT Abfragen',
            description: 'Lerne die grundlegende SELECT-Anweisung',
            difficulty: 'easy',
            task: 'Wähle alle Spalten aus der Tabelle "schueler" aus.',
            starterCode: '-- Deine SQL Abfrage hier\nSELECT\n',
            solution: 'SELECT * FROM schueler;',
            hints: [
                'Verwende SELECT * um alle Spalten auszuwählen',
                'FROM gibt die Tabelle an',
                'Vergiss nicht das Semikolon am Ende'
            ],
            validation: (code) => {
                return code.toLowerCase().includes('select') && code.toLowerCase().includes('from');
            }
        },
        {
            id: 'sql-2',
            number: '4.2',
            title: 'SQL WHERE - Daten filtern',
            description: 'Filtere Daten mit WHERE',
            difficulty: 'easy',
            task: 'Wähle alle Schüler aus, deren Alter (age) größer als 15 ist.',
            starterCode: '-- Deine SQL Abfrage hier\nSELECT * FROM schueler WHERE\n',
            solution: 'SELECT * FROM schueler WHERE age > 15;',
            hints: [
                'Verwende WHERE für Bedingungen',
                'Der Vergleichsoperator > bedeutet "größer als"',
                'Die Spalte heißt "age", nicht "alter"'
            ],
            validation: (code) => {
                return code.toLowerCase().includes('where') && code.toLowerCase().includes('>');
            }
        },
        {
            id: 'sql-3',
            number: '4.3',
            title: 'SQL ORDER BY - Sortieren',
            description: 'Sortiere Ergebnisse',
            difficulty: 'medium',
            task: 'Wähle alle Schüler aus und sortiere sie nach Namen aufsteigend.',
            starterCode: '-- Deine SQL Abfrage hier\nSELECT * FROM schueler\n',
            solution: 'SELECT * FROM schueler ORDER BY name ASC;',
            hints: [
                'ORDER BY sortiert die Ergebnisse',
                'ASC = aufsteigend, DESC = absteigend',
                'Syntax: ORDER BY spaltenname ASC'
            ],
            validation: (code) => {
                return code.toLowerCase().includes('order by');
            }
        },
        {
            id: 'sql-4',
            number: '4.4',
            title: 'SQL INSERT - Daten einfügen',
            description: 'Füge neue Daten ein',
            difficulty: 'medium',
            task: 'Füge einen neuen Schüler mit Namen "Tim Berger", Alter (age) 16 und Klasse "10a" ein.',
            starterCode: '-- Deine SQL Abfrage hier\nINSERT INTO schueler\n',
            solution: 'INSERT INTO schueler (name, age, klasse) VALUES (\'Tim Berger\', 16, \'10a\');',
            hints: [
                'INSERT INTO fügt Daten ein',
                'Syntax: INSERT INTO tabelle (spalten) VALUES (werte)',
                'Die Spalte heißt "age", nicht "alter"'
            ],
            validation: (code) => {
                return code.toLowerCase().includes('insert into') && code.toLowerCase().includes('values');
            }
        },
        {
            id: 'sql-5',
            number: '4.5',
            title: 'SQL UPDATE - Daten aktualisieren',
            description: 'Aktualisiere bestehende Daten',
            difficulty: 'medium',
            task: 'Aktualisiere die Klasse aller Schüler namens "Anna Müller" auf "10a".',
            starterCode: '-- Deine SQL Abfrage hier\nUPDATE schueler\n',
            solution: 'UPDATE schueler SET klasse = \'10a\' WHERE name = \'Anna Müller\';',
            hints: [
                'UPDATE aktualisiert Daten',
                'SET gibt die neuen Werte an',
                'WHERE filtert welche Zeilen aktualisiert werden'
            ],
            validation: (code) => {
                return code.toLowerCase().includes('update') && code.toLowerCase().includes('set');
            }
        },
        {
            id: 'sql-6',
            number: '4.6',
            title: 'SQL DELETE - Daten löschen',
            description: 'Lösche Daten aus der Datenbank',
            difficulty: 'easy',
            task: 'Lösche alle Noten, bei denen die Note schlechter als 3 ist (note > 3).',
            starterCode: '-- Deine SQL Abfrage hier\nDELETE FROM noten\n',
            solution: 'DELETE FROM noten WHERE note > 3;',
            hints: [
                'DELETE FROM löscht Daten',
                'WHERE filtert welche Zeilen gelöscht werden',
                'Sei vorsichtig: ohne WHERE werden ALLE Zeilen gelöscht!'
            ],
            validation: (code) => {
                return code.toLowerCase().includes('delete from') && code.toLowerCase().includes('where');
            }
        },
        {
            id: 'sql-7',
            number: '4.7',
            title: 'SQL JOIN - Tabellen verknüpfen',
            description: 'Verbinde mehrere Tabellen',
            difficulty: 'hard',
            task: 'Verbinde die Tabellen "schueler" und "noten" über die schueler_id.',
            starterCode: '-- Deine SQL Abfrage hier\n',
            solution: 'SELECT * FROM schueler JOIN noten ON schueler.id = noten.schueler_id;',
            hints: [
                'JOIN verbindet Tabellen',
                'ON gibt die Verknüpfungsbedingung an',
                'Syntax: JOIN tabelle2 ON tabelle1.spalte = tabelle2.spalte'
            ],
            validation: (code) => {
                return code.toLowerCase().includes('join') && code.toLowerCase().includes('on');
            }
        }
    ],
    lua: [
        {
            id: 'lua-1',
            number: '6.1',
            title: 'Lua Basics - Erste Schritte',
            description: 'Lerne Lua-Grundlagen kennen',
            difficulty: 'easy',
            task: 'Gib "Hallo Roblox!" mit print() aus.',
            starterCode: '-- Dein Lua Code hier\n',
            solution: 'print("Hallo Roblox!")',
            hints: [
                'Verwende print() um Text auszugeben',
                'Strings stehen in Anführungszeichen',
                'Lua braucht kein Semikolon am Ende'
            ],
            validation: (code) => {
                return code.includes('print(');
            }
        },
        {
            id: 'lua-2',
            number: '6.2',
            title: 'Lua Variablen',
            description: 'Erstelle und nutze Variablen',
            difficulty: 'easy',
            task: 'Erstelle eine Variable "name" mit deinem Namen und gib sie aus.',
            starterCode: '-- Erstelle eine Variable\n',
            solution: 'local name = "Max"\nprint(name)',
            hints: [
                'Variablen werden mit local definiert',
                'Syntax: local variablenname = wert',
                'Gib die Variable mit print() aus'
            ],
            validation: (code) => {
                return code.includes('local') && code.includes('print(');
            }
        },
        {
            id: 'lua-3',
            number: '6.3',
            title: 'Roblox Figur bewegen',
            description: 'Bewege deine Figur mit walk()',
            difficulty: 'easy',
            task: 'Bewege deine Figur 100 Pixel nach rechts mit walk(100).',
            starterCode: '-- Bewege die Figur\n',
            solution: 'walk(100)',
            hints: [
                'Verwende walk(distanz) um zu laufen',
                'Positive Werte gehen nach rechts',
                'Die Distanz ist in Pixeln'
            ],
            validation: (code) => {
                return code.includes('walk(');
            }
        },
        {
            id: 'lua-4',
            number: '6.4',
            title: 'Roblox Figur drehen',
            description: 'Drehe deine Figur',
            difficulty: 'easy',
            task: 'Drehe deine Figur um 90 Grad mit turn(90).',
            starterCode: '-- Drehe die Figur\n',
            solution: 'turn(90)',
            hints: [
                'Verwende turn(grad) zum Drehen',
                'Positive Werte drehen im Uhrzeigersinn',
                '90 Grad ist eine Vierteldrehung'
            ],
            validation: (code) => {
                return code.includes('turn(');
            }
        },
        {
            id: 'lua-5',
            number: '6.5',
            title: 'Roblox Figur springen',
            description: 'Lasse deine Figur springen',
            difficulty: 'medium',
            task: 'Lasse deine Figur springen mit jump().',
            starterCode: '-- Springe!\n',
            solution: 'jump()',
            hints: [
                'Verwende jump() zum Springen',
                'Es werden keine Parameter benötigt',
                'Die Sprunghöhe ist automatisch'
            ],
            validation: (code) => {
                return code.includes('jump(');
            }
        },
        {
            id: 'lua-6',
            number: '6.6',
            title: 'Kombinierte Bewegungen',
            description: 'Kombiniere mehrere Befehle',
            difficulty: 'medium',
            task: 'Laufe 50 Pixel, springe, und drehe um 180 Grad.',
            starterCode: '-- Kombiniere die Befehle\n',
            solution: 'walk(50)\njump()\nturn(180)',
            hints: [
                'Schreibe die Befehle untereinander',
                'Jeder Befehl in einer neuen Zeile',
                'Die Befehle werden nacheinander ausgeführt'
            ],
            validation: (code) => {
                return code.includes('walk(') && code.includes('jump(') && code.includes('turn(');
            }
        },
        {
            id: 'lua-7',
            number: '6.7',
            title: 'Roblox Figur rennen',
            description: 'Laufe schneller mit run()',
            difficulty: 'medium',
            task: 'Renne 150 Pixel mit run(150).',
            starterCode: '-- Renne schnell!\n',
            solution: 'run(150)',
            hints: [
                'run() ist schneller als walk()',
                'Die Syntax ist gleich: run(distanz)',
                'Nutze run() für schnelle Bewegungen'
            ],
            validation: (code) => {
                return code.includes('run(');
            }
        },
        {
            id: 'lua-8',
            number: '6.8',
            title: 'Roblox Figur schießen',
            description: 'Schieße Projektile',
            difficulty: 'hard',
            task: 'Schieße mit shoot().',
            starterCode: '-- Schieße!\n',
            solution: 'shoot()',
            hints: [
                'Verwende shoot() zum Schießen',
                'Die Richtung ist automatisch',
                'Kombiniere mit turn() für verschiedene Richtungen'
            ],
            validation: (code) => {
                return code.includes('shoot(');
            }
        },
        {
            id: 'lua-9',
            number: '6.9',
            title: 'Lua Schleifen',
            description: 'Wiederhole Aktionen mit Schleifen',
            difficulty: 'hard',
            task: 'Laufe 5 mal 20 Pixel mit einer for-Schleife.',
            starterCode: '-- Nutze eine Schleife\n',
            solution: 'for i = 1, 5 do\n  walk(20)\nend',
            hints: [
                'Lua Schleifen: for i = start, ende do ... end',
                'Der Code zwischen do und end wird wiederholt',
                'Einrückung macht den Code lesbarer'
            ],
            validation: (code) => {
                return code.includes('for') && code.includes('do') && code.includes('end');
            }
        },
        {
            id: 'lua-10',
            number: '6.10',
            title: 'Komplexe Choreografie',
            description: 'Erstelle eine Bewegungssequenz',
            difficulty: 'hard',
            task: 'Erstelle eine Sequenz: Laufe, springe, drehe, schieße, und renne zurück.',
            starterCode: '-- Erstelle deine Choreografie\n',
            solution: 'walk(50)\njump()\nturn(90)\nshoot()\nturn(180)\nrun(100)',
            hints: [
                'Kombiniere alle gelernten Befehle',
                'Überlege dir die Reihenfolge',
                'Jeder Befehl in einer neuen Zeile'
            ],
            validation: (code) => {
                return code.includes('walk(') && code.includes('jump(') &&
                       code.includes('turn(') && code.includes('shoot(');
            }
        }
    ]
};

const ACHIEVEMENTS = [
    {
        id: 'first-step',
        title: 'Erste Schritte',
        description: 'Erstes Level abgeschlossen',
        icon: '🎯',
        condition: (stats) => stats.totalCompleted >= 1
    },
    {
        id: 'html-master',
        title: 'HTML Meister',
        description: 'Alle HTML-Level abgeschlossen',
        icon: '🏆',
        condition: (stats) => stats.htmlCompleted >= LEVELS_DATA.html.length
    },
    {
        id: 'css-master',
        title: 'CSS Meister',
        description: 'Alle CSS-Level abgeschlossen',
        icon: '🎨',
        condition: (stats) => stats.cssCompleted >= LEVELS_DATA.css.length
    },
    {
        id: 'python-master',
        title: 'Python Meister',
        description: 'Alle Python-Level abgeschlossen',
        icon: '🐍',
        condition: (stats) => stats.pythonCompleted >= LEVELS_DATA.python.length
    },
    {
        id: 'sql-master',
        title: 'SQL Meister',
        description: 'Alle SQL-Level abgeschlossen',
        icon: '💾',
        condition: (stats) => stats.sqlCompleted >= LEVELS_DATA.sql.length
    },
    {
        id: 'lua-master',
        title: 'Lua Meister',
        description: 'Alle Lua-Level abgeschlossen',
        icon: '🎮',
        condition: (stats) => stats.luaCompleted >= LEVELS_DATA.lua.length
    },
    {
        id: 'perfectionist',
        title: 'Perfektionist',
        description: 'Alle Level abgeschlossen',
        icon: '⭐',
        condition: (stats) => {
            const total = LEVELS_DATA.html.length + LEVELS_DATA.css.length + LEVELS_DATA.python.length + LEVELS_DATA.sql.length + LEVELS_DATA.lua.length;
            return stats.totalCompleted >= total;
        }
    },
    {
        id: 'persistent',
        title: 'Ausdauernd',
        description: '50 Versuche gemacht',
        icon: '💪',
        condition: (stats) => stats.totalAttempts >= 50
    },
    {
        id: 'independent',
        title: 'Unabhängig',
        description: '10 Level ohne Hinweise gelöst',
        icon: '🧠',
        condition: (stats) => stats.solvedWithoutHints >= 10
    },
    {
        id: 'fast-learner',
        title: 'Schnelllerner',
        description: '5 Level im ersten Versuch gelöst',
        icon: '⚡',
        condition: (stats) => stats.firstTrySuccess >= 5
    }
];

// ==================== STATE MANAGEMENT ====================

let currentUser = null;
let currentSection = 'html';
let currentLevel = null;
let editor = null;
let freeEditor = null;
let pyodideReady = false;
let pyodide = null;
let sqlDB = null;
let sqlReady = false;
let luaReady = false;

let userProgress = {
    completedLevels: [],
    stats: {
        totalCompleted: 0,
        htmlCompleted: 0,
        cssCompleted: 0,
        pythonCompleted: 0,
        sqlCompleted: 0,
        luaCompleted: 0,
        totalAttempts: 0,
        hintsUsed: 0,
        solutionsViewed: 0,
        solvedWithoutHints: 0,
        firstTrySuccess: 0
    },
    levelStats: {},
    unlockedAchievements: [],
    languageModalShown: {}
};

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Check if user is logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = savedUser;
        loadUserProgress();
        showMainApp();
    } else {
        showLoginScreen();
    }

    // Setup event listeners
    setupEventListeners();

    // Initialize Pyodide for Python execution
    initializePyodide();

    // Initialize SQL.js database
    initializeSQL();

    // Initialize Lua
    initializeLua();
}

function setupEventListeners() {
    // Login
    document.getElementById('loginForm')?.addEventListener('submit', handleLogin);

    // Logout
    document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);

    // Theme toggle
    document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);

    // Navigation tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const section = e.target.dataset.section;
            switchSection(section);
        });
    });

    // Modal
    document.getElementById('modalClose')?.addEventListener('click', closeModal);

    // Difficulty filters
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.addEventListener('click', handleDifficultyFilter);
    });

    // Free editor
    document.getElementById('freeEditorLanguage')?.addEventListener('change', handleFreeEditorLanguageChange);
    document.getElementById('runFreeCode')?.addEventListener('click', runFreeCode);
    document.getElementById('clearFreeCode')?.addEventListener('click', clearFreeCode);
}

// ==================== AUTHENTICATION ====================

function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Simple authentication (admin/admin123)
    if (username === 'admin' && password === 'admin123') {
        currentUser = username;
        localStorage.setItem('currentUser', username);
        loadUserProgress();
        showMainApp();
        playSound('success');
    } else {
        document.getElementById('loginError').style.display = 'block';
        playSound('error');
    }
}

function handleLogout() {
    if (confirm('Möchtest du dich wirklich abmelden?')) {
        saveUserProgress();
        localStorage.removeItem('currentUser');
        currentUser = null;
        window.location.reload();
    }
}

function showLoginScreen() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('mainApp').style.display = 'none';
}

function showMainApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    document.getElementById('currentUser').textContent = currentUser;

    initializeSections();
    updateProgress();
    updateStatistics();
    loadAchievements();
}

// ==================== DATA PERSISTENCE ====================

function loadUserProgress() {
    const saved = localStorage.getItem(`userProgress_${currentUser}`);
    if (saved) {
        userProgress = JSON.parse(saved);
    }
}

function saveUserProgress() {
    localStorage.setItem(`userProgress_${currentUser}`, JSON.stringify(userProgress));
    exportToExcel(); // Auto-export
}

async function exportToExcel() {
    // Create CSV data for Excel export
    const csvData = generateCSVData();
    localStorage.setItem(`exportData_${currentUser}`, csvData);

    // Send to Notion if backend is available
    try {
        await sendToNotion();
    } catch (error) {
        console.log('Notion sync not available:', error);
    }
}

function generateCSVData() {
    let csv = 'Benutzer,Level,Versuche,Hinweise,Gelöst,Zeitstempel\n';

    Object.entries(userProgress.levelStats).forEach(([levelId, stats]) => {
        csv += `${currentUser},${levelId},${stats.attempts},${stats.hintsUsed},${stats.completed},${stats.completedAt || ''}\n`;
    });

    return csv;
}

// ==================== SECTIONS & NAVIGATION ====================

function switchSection(section) {
    // Update active tab
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-section="${section}"]`).classList.add('active');

    // Update active section
    document.querySelectorAll('.section').forEach(sec => {
        sec.classList.remove('active');
    });
    document.querySelector(`.section[data-section="${section}"]`).classList.add('active');

    currentSection = section;

    // Show welcome modal for programming sections (not statistics, achievements, etc.)
    if (['html', 'css', 'python', 'sql', 'lua'].includes(section)) {
        showLanguageWelcomeModal(section);
    }

    // Initialize section if needed
    if (section === 'freeEditor' && !freeEditor) {
        initializeFreeEditor();
    }
}

function initializeSections() {
    renderLevelGrid('html');
    renderLevelGrid('css');
    renderLevelGrid('python');
    renderLevelGrid('sql');
    renderLevelGrid('lua');
    initializeFreeEditor();
}

function renderLevelGrid(language) {
    const container = document.getElementById(`${language}Levels`);
    if (!container) return;

    container.innerHTML = '';

    LEVELS_DATA[language].forEach((level, index) => {
        const card = createLevelCard(level, language, index);
        container.appendChild(card);
    });
}

function createLevelCard(level, language, index) {
    const isCompleted = userProgress.completedLevels.includes(level.id);
    const isLocked = false; // Allow all levels to be clickable

    const card = document.createElement('div');
    card.className = `level-card ${isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''}`;

    card.innerHTML = `
        <div class="level-number">${level.number}</div>
        <div class="level-title">${level.title}</div>
        <div class="level-description">${level.description}</div>
        <div class="level-meta">
            <span class="difficulty-badge difficulty-${level.difficulty}">
                ${level.difficulty === 'easy' ? 'Leicht' : level.difficulty === 'medium' ? 'Mittel' : 'Schwer'}
            </span>
            <span class="level-status">
                ${isCompleted ? '✅ Gelöst' : ''}
            </span>
        </div>
    `;

    if (!isLocked) {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => openLevel(level, language));
    }

    return card;
}

// ==================== LANGUAGE WELCOME MODAL ====================

const LANGUAGE_INFO = {
    html: {
        name: 'HTML',
        icon: 'img/html.png',
        quote: '"HTML ist die Sprache, mit der wir das Web strukturieren. Jede Website beginnt hier!"'
    },
    css: {
        name: 'CSS',
        icon: 'img/css.png',
        quote: '"Mit CSS hauchen wir dem Web Leben ein. Design ist nicht nur wie es aussieht, sondern wie es funktioniert!"'
    },
    python: {
        name: 'Python',
        icon: 'img/python.png',
        quote: '"Python ist eine der mächtigsten Sprachen der Welt. Von KI bis Webentwicklung - Python kann alles!"'
    },
    sql: {
        name: 'SQL',
        icon: 'img/sql.png',
        quote: '"Daten sind das neue Gold. Mit SQL lernst du, diese Schätze zu heben und zu verwalten!"'
    },
    lua: {
        name: 'Lua',
        icon: 'img/lua.png',
        quote: '"Lua ist die Sprache der Spieleentwicklung! Mit Roblox kannst du deine eigenen Welten erschaffen!"'
    }
};

function showLanguageWelcomeModal(language) {
    // Check if modal was already shown for this language in this session
    if (userProgress.languageModalShown[language]) {
        return;
    }

    const langInfo = LANGUAGE_INFO[language];
    if (!langInfo) return;

    const modal = document.getElementById('languageModal');
    const title = document.getElementById('languageModalTitle');
    const subtitle = document.getElementById('languageModalSubtitle');
    const quote = document.getElementById('languageModalQuote');
    const icon = document.getElementById('languageModalIcon');

    title.textContent = `Willkommen bei ${langInfo.name}!`;
    subtitle.textContent = `Schön, dass du dich für diese Übung in ${langInfo.name} entschieden hast!`;
    quote.textContent = langInfo.quote;
    icon.src = langInfo.icon;

    modal.classList.add('active');

    // Mark as shown
    userProgress.languageModalShown[language] = true;
    saveUserProgress();
}

function closeLanguageModal() {
    const modal = document.getElementById('languageModal');
    modal.classList.remove('active');
}

// ==================== CALLIOPE FUNCTIONS ====================

function openCalliopeEditor(mode) {
    if (mode === 'block') {
        // Open block editor
        window.open('https://makecode.calliope.cc/#editor', '_blank');
        showNotification('Block-Editor wird in neuem Tab geöffnet...', 'info');
    } else if (mode === 'text') {
        // Open text editor (JavaScript mode)
        window.open('https://makecode.calliope.cc/#editor', '_blank');
        showNotification('Text-Editor wird in neuem Tab geöffnet... Wechsle dort zu JavaScript!', 'info');
    }
}

// ==================== LEVEL SCREEN ====================

function openLevel(level, language) {
    currentLevel = level;

    // Show welcome modal on first level of each language
    const levelIndex = LEVELS_DATA[language].findIndex(l => l.id === level.id);
    if (levelIndex === 0) {
        showLanguageWelcomeModal(language);
    }

    // Hide level overview
    const section = document.querySelector(`.section[data-section="${language}"]`);
    section.querySelector('.level-overview').style.display = 'none';

    // Show coding screen
    const codingScreen = document.getElementById(`${language}CodingScreen`);
    codingScreen.classList.add('active');
    codingScreen.innerHTML = createCodingScreen(level, language);

    // Initialize editor
    setTimeout(() => {
        initializeEditor(level, language);
    }, 100);

    // Initialize level stats if needed
    if (!userProgress.levelStats[level.id]) {
        userProgress.levelStats[level.id] = {
            attempts: 0,
            hintsUsed: 0,
            completed: false,
            usedHint: false
        };
    }
}

function createCodingScreen(level, language) {
    const needsConsole = language === 'python' || language === 'sql';
    const needsCanvas = language === 'lua';
    const needsDBSchema = language === 'sql';

    return `
        <div class="coding-header">
            <div class="coding-title">${level.number} - ${level.title}</div>
            <div class="coding-description"><strong>Aufgabe:</strong> ${level.task}</div>
            <div class="coding-controls">
                <button class="btn btn-secondary" onclick="backToLevels('${language}')">← Zurück</button>
                <button class="btn btn-info" onclick="showHint()">💡 Tipp</button>
                <button class="btn btn-warning" onclick="showSolution()">🔍 Lösung anzeigen</button>
                <button class="btn btn-success" onclick="runCode()">▶ Code ausführen</button>
                <button class="btn btn-secondary" onclick="skipLevel('${language}')">⏭ Überspringen</button>
            </div>
        </div>
        ${needsDBSchema ? '<div id="dbSchemaContainer"></div>' : ''}
        <div class="coding-workspace">
            <div class="editor-panel">
                <div class="panel-header">Code Editor</div>
                <div id="codeEditor"></div>
            </div>
            <div class="output-panel">
                <div class="panel-header">Ausgabe / Vorschau</div>
                <div class="output-content">
                    ${needsCanvas ?
                        '<div class="roblox-canvas-container"><canvas id="robloxCanvas"></canvas></div>' :
                        needsConsole ?
                        '<div class="output-console" id="outputConsole"></div>' :
                        '<iframe class="output-iframe" id="outputPreview"></iframe>'
                    }
                </div>
            </div>
        </div>
    `;
}

function initializeEditor(level, language) {
    let mode = 'htmlmixed';
    if (language === 'python') mode = 'python';
    else if (language === 'sql') mode = 'sql';
    else if (language === 'lua') mode = 'lua';
    else if (language === 'css' || language === 'html') mode = 'htmlmixed';

    const theme = document.documentElement.dataset.theme === 'dark' ? 'monokai' : 'eclipse';

    editor = CodeMirror(document.getElementById('codeEditor'), {
        value: level.starterCode,
        mode: mode,
        theme: theme,
        lineNumbers: true,
        autoCloseBrackets: true,
        matchBrackets: true,
        indentUnit: 4,
        tabSize: 4,
        lineWrapping: true
    });

    editor.setSize('100%', '100%');

    // Initialize canvas for Lua
    if (language === 'lua') {
        initializeRobloxCanvas();
    }

    // Initialize database schema for SQL
    if (language === 'sql') {
        setTimeout(() => {
            renderDatabaseSchema();
        }, 100);
    }
}

function backToLevels(language) {
    const section = document.querySelector(`.section[data-section="${language}"]`);
    section.querySelector('.level-overview').style.display = 'block';
    document.getElementById(`${language}CodingScreen`).classList.remove('active');
    currentLevel = null;
    editor = null;
}

function skipLevel(language) {
    if (confirm('Möchtest du dieses Level wirklich überspringen?')) {
        showNotification('Level übersprungen', 'info');
        backToLevels(language);
    }
}

// ==================== CODE EXECUTION ====================

function runCode() {
    if (!currentLevel || !editor) return;

    const code = editor.getValue();
    const language = currentSection;

    // Update attempts
    userProgress.levelStats[currentLevel.id].attempts++;
    userProgress.stats.totalAttempts++;

    if (language === 'python') {
        runPythonCode(code);
    } else if (language === 'sql') {
        runSQLCode(code);
    } else if (language === 'lua') {
        runLuaCode(code);
    } else {
        runHTMLCSSCode(code);
    }

    saveUserProgress();
}

function runHTMLCSSCode(code) {
    const preview = document.getElementById('outputPreview');
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    preview.src = url;

    // Check validation
    setTimeout(() => {
        checkSolution(code);
    }, 500);
}

async function runPythonCode(code) {
    const outputConsole = document.getElementById('outputConsole');
    outputConsole.innerHTML = '<div class="loading-spinner"></div>';

    if (!pyodideReady) {
        outputConsole.innerHTML = '<div class="error">Python wird geladen... Bitte warte einen Moment.</div>';
        return;
    }

    try {
        // Redirect stdout
        pyodide.runPython(`
import sys
import io
sys.stdout = io.StringIO()
        `);

        // Run user code
        pyodide.runPython(code);

        // Get output
        const output = pyodide.runPython('sys.stdout.getvalue()');

        outputConsole.innerHTML = `<div class="output-line success">${output || 'Programm ausgeführt (keine Ausgabe)'}</div>`;

        // Check solution
        checkSolution(code);
    } catch (err) {
        outputConsole.innerHTML = `<div class="error">Fehler: ${err.message}</div>`;
        playSound('error');
    }
}

function runSQLCode(code) {
    const outputConsole = document.getElementById('outputConsole');

    if (!sqlReady || !sqlDB) {
        outputConsole.innerHTML = '<div class="error">SQL-Datenbank wird geladen... Bitte warte einen Moment.</div>';
        return;
    }

    try {
        // Execute the SQL query
        const results = sqlDB.exec(code);

        if (results.length === 0) {
            // No results (e.g., INSERT, UPDATE, DELETE)
            outputConsole.innerHTML = `
                <div class="output-line success">✓ SQL Abfrage erfolgreich ausgeführt!</div>
                <div class="output-line" style="margin-top: 10px; padding: 10px; background: var(--bg-secondary); border-radius: 5px;">
                    <strong>Deine Abfrage:</strong><br>
                    <code>${escapeHtml(code)}</code>
                </div>
            `;
        } else {
            // Display results as table
            const result = results[0];
            const columns = result.columns;
            const values = result.values;

            let tableHTML = '<table class="sql-results-table"><thead><tr>';

            columns.forEach(col => {
                tableHTML += `<th>${escapeHtml(col)}</th>`;
            });

            tableHTML += '</tr></thead><tbody>';

            values.forEach(row => {
                tableHTML += '<tr>';
                row.forEach(cell => {
                    tableHTML += `<td>${escapeHtml(String(cell))}</td>`;
                });
                tableHTML += '</tr>';
            });

            tableHTML += '</tbody></table>';

            outputConsole.innerHTML = `
                <div class="sql-info">
                    ✓ Abfrage erfolgreich! ${values.length} Zeile(n) gefunden.
                </div>
                ${tableHTML}
            `;
        }

        // Check solution
        setTimeout(() => {
            checkSolution(code);
        }, 500);

    } catch (err) {
        outputConsole.innerHTML = `<div class="error">SQL Fehler: ${escapeHtml(err.message)}</div>`;
        playSound('error');
    }
}

function checkSolution(code) {
    if (!currentLevel) return;

    const isCorrect = currentLevel.validation(code);

    if (isCorrect) {
        // Mark as completed
        if (!userProgress.completedLevels.includes(currentLevel.id)) {
            userProgress.completedLevels.push(currentLevel.id);
            userProgress.stats.totalCompleted++;

            // Update language-specific count
            const lang = currentSection;
            userProgress.stats[`${lang}Completed`]++;

            // Check if solved without hints
            if (!userProgress.levelStats[currentLevel.id].usedHint) {
                userProgress.stats.solvedWithoutHints++;
            }

            // Check if first try
            if (userProgress.levelStats[currentLevel.id].attempts === 1) {
                userProgress.stats.firstTrySuccess++;
            }
        }

        userProgress.levelStats[currentLevel.id].completed = true;
        userProgress.levelStats[currentLevel.id].completedAt = new Date().toISOString();

        showNotification('🎉 Level erfolgreich abgeschlossen!', 'success');
        playSound('success');

        // Update UI
        updateProgress();
        updateStatistics();
        checkAchievements();
        saveUserProgress();

        // Unlock next level
        setTimeout(() => {
            if (confirm('Level abgeschlossen! Möchtest du zum nächsten Level?')) {
                goToNextLevel();
            }
        }, 1000);
    } else {
        showNotification('❌ Noch nicht ganz richtig. Versuche es noch einmal!', 'error');
        playSound('error');
    }
}

function goToNextLevel() {
    const currentLang = currentSection;
    const levels = LEVELS_DATA[currentLang];
    const currentIndex = levels.findIndex(l => l.id === currentLevel.id);

    if (currentIndex < levels.length - 1) {
        backToLevels(currentLang);
        setTimeout(() => {
            openLevel(levels[currentIndex + 1], currentLang);
        }, 300);
    } else {
        backToLevels(currentLang);
        showNotification('🎊 Du hast alle Level in diesem Bereich abgeschlossen!', 'success');
    }
}

// ==================== HINTS & SOLUTIONS ====================

function showHint() {
    if (!currentLevel) return;

    const stats = userProgress.levelStats[currentLevel.id];
    const hintIndex = stats.hintsUsed % currentLevel.hints.length;
    const hint = currentLevel.hints[hintIndex];

    stats.hintsUsed++;
    stats.usedHint = true;
    userProgress.stats.hintsUsed++;

    showModal('💡 Tipp', hint);
    saveUserProgress();
    playSound('info');
}

function showSolution() {
    if (!currentLevel) return;

    if (confirm('Möchtest du wirklich die Lösung sehen? Das Level wird dann nicht als eigenständig gelöst gezählt.')) {
        userProgress.levelStats[currentLevel.id].usedHint = true;
        userProgress.stats.solutionsViewed++;

        showModal('🔍 Lösung', `<pre style="background: var(--code-bg); padding: 15px; border-radius: 8px; overflow-x: auto;">${escapeHtml(currentLevel.solution)}</pre>`);

        // Show solution in editor
        if (editor) {
            editor.setValue(currentLevel.solution);
        }

        saveUserProgress();
        playSound('info');
    }
}

// ==================== FREE EDITOR ====================

function initializeFreeEditor() {
    if (freeEditor) return;

    const theme = document.documentElement.dataset.theme === 'dark' ? 'monokai' : 'eclipse';

    freeEditor = CodeMirror(document.getElementById('freeEditor'), {
        value: '<!-- Schreibe deinen Code hier -->\n',
        mode: 'htmlmixed',
        theme: theme,
        lineNumbers: true,
        autoCloseBrackets: true,
        matchBrackets: true,
        indentUnit: 4,
        tabSize: 4,
        lineWrapping: true
    });

    freeEditor.setSize('100%', '100%');
}

function handleFreeEditorLanguageChange(e) {
    const language = e.target.value;
    freeEditor.setOption('mode', language);

    // Update placeholder
    const placeholders = {
        'htmlmixed': '<!-- Schreibe deinen HTML Code hier -->\n',
        'css': '/* Schreibe dein CSS hier */\n',
        'python': '# Schreibe deinen Python Code hier\n',
        'sql': '-- Schreibe deine SQL Abfrage hier\nSELECT * FROM schueler;\n',
        'lua': '-- Schreibe deinen Lua Code hier\nprint("Hallo Roblox!")\n'
    };

    if (freeEditor.getValue().trim() === '' || freeEditor.getValue().includes('Schreibe deinen')) {
        freeEditor.setValue(placeholders[language]);
    }

    // Update output display
    const preview = document.getElementById('freePreview');
    const console = document.getElementById('freeOutput');

    if (language === 'python' || language === 'sql' || language === 'lua') {
        preview.style.display = 'none';
        console.style.display = 'block';
    } else {
        preview.style.display = 'block';
        console.style.display = 'none';
    }
}

function runFreeCode() {
    const language = document.getElementById('freeEditorLanguage').value;
    const code = freeEditor.getValue();

    if (language === 'python') {
        runFreePython(code);
    } else if (language === 'sql') {
        runFreeSQL(code);
    } else if (language === 'lua') {
        runFreeLua(code);
    } else {
        runFreeHTMLCSS(code);
    }
}

function runFreeHTMLCSS(code) {
    const preview = document.getElementById('freePreview');
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    preview.src = url;
    showNotification('Code ausgeführt!', 'success');
}

async function runFreePython(code) {
    const output = document.getElementById('freeOutput');
    output.innerHTML = '<div class="loading-spinner"></div>';

    if (!pyodideReady) {
        output.innerHTML = '<div class="error">Python wird geladen... Bitte warte einen Moment.</div>';
        return;
    }

    try {
        pyodide.runPython(`
import sys
import io
sys.stdout = io.StringIO()
        `);

        pyodide.runPython(code);
        const result = pyodide.runPython('sys.stdout.getvalue()');

        output.innerHTML = `<div class="output-line success">${result || 'Programm ausgeführt (keine Ausgabe)'}</div>`;
        showNotification('Code ausgeführt!', 'success');
    } catch (err) {
        output.innerHTML = `<div class="error">Fehler: ${err.message}</div>`;
        showNotification('Fehler im Code', 'error');
    }
}

function runFreeSQL(code) {
    const output = document.getElementById('freeOutput');

    if (!sqlReady || !sqlDB) {
        output.innerHTML = '<div class="error">SQL-Datenbank wird geladen... Bitte warte einen Moment.</div>';
        return;
    }

    try {
        const results = sqlDB.exec(code);

        if (results.length === 0) {
            output.innerHTML = `
                <div class="output-line success">✓ SQL Abfrage erfolgreich ausgeführt!</div>
                <div class="output-line" style="margin-top: 10px; padding: 10px; background: var(--bg-secondary); border-radius: 5px;">
                    <strong>Deine Abfrage:</strong><br>
                    <code>${escapeHtml(code)}</code>
                </div>
            `;
        } else {
            const result = results[0];
            const columns = result.columns;
            const values = result.values;

            let tableHTML = '<table class="sql-results-table"><thead><tr>';
            columns.forEach(col => {
                tableHTML += `<th>${escapeHtml(col)}</th>`;
            });
            tableHTML += '</tr></thead><tbody>';
            values.forEach(row => {
                tableHTML += '<tr>';
                row.forEach(cell => {
                    tableHTML += `<td>${escapeHtml(String(cell))}</td>`;
                });
                tableHTML += '</tr>';
            });
            tableHTML += '</tbody></table>';

            output.innerHTML = `
                <div class="sql-info">
                    ✓ Abfrage erfolgreich! ${values.length} Zeile(n) gefunden.
                </div>
                ${tableHTML}
            `;
        }

        showNotification('SQL-Code ausgeführt!', 'success');
    } catch (err) {
        output.innerHTML = `<div class="error">SQL Fehler: ${escapeHtml(err.message)}</div>`;
        showNotification('SQL Fehler!', 'error');
    }
}

function runFreeLua(code) {
    const output = document.getElementById('freeOutput');

    if (!luaReady) {
        output.innerHTML = '<div class="error">Lua wird geladen... Bitte warte einen Moment.</div>';
        return;
    }

    try {
        // Capture console output
        let consoleOutput = [];
        const originalLog = console.log;
        console.log = function(...args) {
            consoleOutput.push(args.join(' '));
            originalLog.apply(console, args);
        };

        const luaEnv = `
            function print(...)
                local args = {...}
                local str = ""
                for i, v in ipairs(args) do
                    str = str .. tostring(v)
                    if i < #args then str = str .. "\\t" end
                end
                js.global.console:log(str)
            end

            ${code}
        `;

        fengari.load(luaEnv)();

        console.log = originalLog;

        if (consoleOutput.length > 0) {
            output.innerHTML = `<div class="output-line success">${consoleOutput.join('\n')}</div>`;
        } else {
            output.innerHTML = '<div class="output-line success">Programm ausgeführt (keine Ausgabe)</div>';
        }

        showNotification('Lua-Code ausgeführt!', 'success');
    } catch (err) {
        output.innerHTML = `<div class="error">Lua Fehler: ${escapeHtml(err.message)}</div>`;
        showNotification('Lua Fehler!', 'error');
    }
}

function clearFreeCode() {
    const language = document.getElementById('freeEditorLanguage').value;
    const placeholders = {
        'htmlmixed': '<!-- Schreibe deinen HTML Code hier -->\n',
        'css': '/* Schreibe dein CSS hier */\n',
        'python': '# Schreibe deinen Python Code hier\n',
        'sql': '-- Schreibe deine SQL Abfrage hier\nSELECT * FROM schueler;\n',
        'lua': '-- Schreibe deinen Lua Code hier\nprint("Hallo Roblox!")\n'
    };

    freeEditor.setValue(placeholders[language]);
    document.getElementById('freeOutput').innerHTML = '';
    document.getElementById('freePreview').src = 'about:blank';
}

// ==================== PYODIDE INITIALIZATION ====================

async function initializePyodide() {
    try {
        pyodide = await loadPyodide();
        pyodideReady = true;
        console.log('Pyodide loaded successfully');
    } catch (err) {
        console.error('Failed to load Pyodide:', err);
        pyodideReady = false;
    }
}

// ==================== DATABASE SCHEMA VIEWER ====================

function renderDatabaseSchema() {
    const container = document.getElementById('dbSchemaContainer');
    if (!container || !sqlReady || !sqlDB) return;

    container.innerHTML = `
        <div class="db-schema-panel">
            <div class="db-schema-header">
                <div class="db-schema-title">📊 Datenbank Referenz</div>
                <button class="db-toggle-btn" onclick="toggleDBSchema()">Ausblenden</button>
            </div>
            <div class="db-table-tabs">
                <button class="db-table-tab active" onclick="switchDBTable('schueler')">Schüler</button>
                <button class="db-table-tab" onclick="switchDBTable('noten')">Noten</button>
                <button class="db-table-tab" onclick="switchDBTable('kurse')">Kurse</button>
            </div>
            <div id="dbTableContent"></div>
        </div>
    `;

    // Load initial table
    switchDBTable('schueler');
}

function switchDBTable(tableName) {
    if (!sqlReady || !sqlDB) return;

    // Update active tab
    document.querySelectorAll('.db-table-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event?.target?.classList?.add('active') || document.querySelector(`.db-table-tab:first-child`).classList.add('active');

    try {
        const result = sqlDB.exec(`SELECT * FROM ${tableName}`);
        const content = document.getElementById('dbTableContent');

        if (result.length === 0) {
            content.innerHTML = '<p style="color: var(--text-secondary);">Keine Daten gefunden.</p>';
            return;
        }

        const columns = result[0].columns;
        const values = result[0].values;

        let tableHTML = '<div class="db-table-view active"><table class="db-schema-table"><thead><tr>';

        columns.forEach(col => {
            tableHTML += `<th>${escapeHtml(col)}</th>`;
        });

        tableHTML += '</tr></thead><tbody>';

        values.forEach(row => {
            tableHTML += '<tr>';
            row.forEach(cell => {
                tableHTML += `<td>${escapeHtml(String(cell))}</td>`;
            });
            tableHTML += '</tr>';
        });

        tableHTML += '</tbody></table></div>';

        content.innerHTML = tableHTML;
    } catch (err) {
        console.error('Error loading table:', err);
        document.getElementById('dbTableContent').innerHTML = `<p style="color: red;">Fehler beim Laden der Tabelle: ${escapeHtml(err.message)}</p>`;
    }
}

function toggleDBSchema() {
    const panel = document.querySelector('.db-schema-panel');
    const btn = document.querySelector('.db-toggle-btn');

    if (panel.style.display === 'none') {
        panel.style.display = 'block';
        btn.textContent = 'Ausblenden';
    } else {
        panel.style.display = 'none';
        btn.textContent = 'Einblenden';
    }
}

// ==================== SQL.JS INITIALIZATION ====================

async function initializeSQL() {
    try {
        const SQL = await initSqlJs({
            locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
        });

        // Try to load the database file
        try {
            const response = await fetch('schuldb.sqlite');
            if (response.ok) {
                const buffer = await response.arrayBuffer();
                sqlDB = new SQL.Database(new Uint8Array(buffer));
                console.log('SQL database loaded from file');
            } else {
                throw new Error('Database file not found, creating in-memory database');
            }
        } catch (fetchError) {
            console.log('Creating in-memory database:', fetchError.message);
            // Fallback: Create database in memory
            sqlDB = new SQL.Database();

            // Create tables
            sqlDB.run(`
                CREATE TABLE schueler (
                    id INTEGER PRIMARY KEY,
                    name TEXT NOT NULL,
                    age INTEGER,
                    klasse TEXT
                );
            `);

            sqlDB.run(`
                CREATE TABLE noten (
                    id INTEGER PRIMARY KEY,
                    schueler_id INTEGER,
                    fach TEXT,
                    note INTEGER,
                    FOREIGN KEY(schueler_id) REFERENCES schueler(id)
                );
            `);

            sqlDB.run(`
                CREATE TABLE kurse (
                    id INTEGER PRIMARY KEY,
                    kursname TEXT,
                    lehrer TEXT,
                    raum TEXT
                );
            `);

            // Insert sample data - Schueler
            sqlDB.run(`
                INSERT INTO schueler (id, name, age, klasse) VALUES
                (1, 'Anna Müller', 15, '9a'),
                (2, 'Ben Schmidt', 16, '10b'),
                (3, 'Clara Wagner', 15, '9a'),
                (4, 'David Klein', 17, '11c'),
                (5, 'Emma Fischer', 16, '10b'),
                (6, 'Felix Weber', 15, '9a'),
                (7, 'Greta Meyer', 16, '10a'),
                (8, 'Hannah Bauer', 17, '11c'),
                (9, 'Leon Hoffmann', 15, '9b'),
                (10, 'Maria Schneider', 16, '10a');
            `);

            // Insert sample data - Noten
            sqlDB.run(`
                INSERT INTO noten (id, schueler_id, fach, note) VALUES
                (1, 1, 'Mathematik', 2),
                (2, 1, 'Deutsch', 1),
                (3, 1, 'Englisch', 2),
                (4, 1, 'Informatik', 1),
                (5, 2, 'Mathematik', 3),
                (6, 2, 'Deutsch', 2),
                (7, 2, 'Englisch', 3),
                (8, 2, 'Informatik', 2),
                (9, 3, 'Mathematik', 1),
                (10, 3, 'Deutsch', 2),
                (11, 3, 'Englisch', 1),
                (12, 3, 'Informatik', 1),
                (13, 4, 'Mathematik', 2),
                (14, 4, 'Deutsch', 3),
                (15, 4, 'Englisch', 2),
                (16, 4, 'Informatik', 2),
                (17, 5, 'Mathematik', 3),
                (18, 5, 'Deutsch', 3),
                (19, 5, 'Englisch', 2),
                (20, 5, 'Informatik', 3),
                (21, 6, 'Mathematik', 2),
                (22, 6, 'Deutsch', 2),
                (23, 6, 'Englisch', 2),
                (24, 6, 'Informatik', 1),
                (25, 7, 'Mathematik', 1),
                (26, 7, 'Deutsch', 1),
                (27, 7, 'Englisch', 1),
                (28, 7, 'Informatik', 1),
                (29, 8, 'Mathematik', 2),
                (30, 8, 'Deutsch', 2),
                (31, 8, 'Englisch', 3),
                (32, 8, 'Informatik', 2),
                (33, 9, 'Mathematik', 3),
                (34, 9, 'Deutsch', 3),
                (35, 9, 'Englisch', 3),
                (36, 9, 'Informatik', 3),
                (37, 10, 'Mathematik', 2),
                (38, 10, 'Deutsch', 1),
                (39, 10, 'Englisch', 2),
                (40, 10, 'Informatik', 1);
            `);

            // Insert sample data - Kurse
            sqlDB.run(`
                INSERT INTO kurse (id, kursname, lehrer, raum) VALUES
                (1, 'Informatik Grundlagen', 'Herr Müller', 'R101'),
                (2, 'Web-Entwicklung', 'Frau Schmidt', 'R102'),
                (3, 'Datenbanken', 'Herr Weber', 'R103'),
                (4, 'Python Programmierung', 'Frau Klein', 'R104'),
                (5, 'JavaScript Basics', 'Herr Meyer', 'R105'),
                (6, 'App-Entwicklung', 'Frau Becker', 'R106');
            `);
        }

        sqlReady = true;
        console.log('SQL.js loaded and database initialized');
    } catch (err) {
        console.error('Failed to initialize SQL.js:', err);
        sqlReady = false;
    }
}

// ==================== LUA INITIALIZATION ====================

function initializeLua() {
    if (typeof fengari !== 'undefined') {
        luaReady = true;
        console.log('Fengari Lua loaded successfully');
    } else {
        luaReady = false;
        console.error('Fengari Lua not available');
    }
}

// ==================== ROBLOX CANVAS IMPLEMENTATION ====================

let robloxCharacter = {
    x: 200,
    y: 300,
    angle: 0,
    width: 40,
    height: 60,
    speed: 2
};

let robloxCanvas = null;
let robloxCtx = null;
let projectiles = [];

function initializeRobloxCanvas() {
    robloxCanvas = document.getElementById('robloxCanvas');
    if (!robloxCanvas) return;

    robloxCanvas.width = robloxCanvas.offsetWidth;
    robloxCanvas.height = robloxCanvas.offsetHeight;
    robloxCtx = robloxCanvas.getContext('2d');

    // Reset character position
    robloxCharacter = {
        x: robloxCanvas.width / 2,
        y: robloxCanvas.height - 100,
        angle: 0,
        width: 40,
        height: 60,
        speed: 2
    };

    projectiles = [];

    drawRobloxScene();
}

function drawRobloxScene() {
    if (!robloxCanvas || !robloxCtx) return;

    // Clear canvas
    robloxCtx.clearRect(0, 0, robloxCanvas.width, robloxCanvas.height);

    // Draw ground
    robloxCtx.fillStyle = '#90EE90';
    robloxCtx.fillRect(0, robloxCanvas.height - 50, robloxCanvas.width, 50);

    // Draw character
    robloxCtx.save();
    robloxCtx.translate(robloxCharacter.x, robloxCharacter.y);
    robloxCtx.rotate((robloxCharacter.angle * Math.PI) / 180);

    // Body (rectangle)
    robloxCtx.fillStyle = '#4A90E2';
    robloxCtx.fillRect(-robloxCharacter.width / 2, -robloxCharacter.height / 2, robloxCharacter.width, robloxCharacter.height * 0.6);

    // Head (circle)
    robloxCtx.fillStyle = '#FFD700';
    robloxCtx.beginPath();
    robloxCtx.arc(0, -robloxCharacter.height / 2 - 10, 15, 0, Math.PI * 2);
    robloxCtx.fill();

    // Eyes
    robloxCtx.fillStyle = '#000';
    robloxCtx.fillRect(-7, -robloxCharacter.height / 2 - 13, 5, 5);
    robloxCtx.fillRect(2, -robloxCharacter.height / 2 - 13, 5, 5);

    // Arms
    robloxCtx.fillStyle = '#4A90E2';
    robloxCtx.fillRect(-robloxCharacter.width / 2 - 8, -robloxCharacter.height / 2, 8, 25);
    robloxCtx.fillRect(robloxCharacter.width / 2, -robloxCharacter.height / 2, 8, 25);

    // Legs
    robloxCtx.fillRect(-robloxCharacter.width / 4 - 5, robloxCharacter.height * 0.1, 10, 25);
    robloxCtx.fillRect(robloxCharacter.width / 4 - 5, robloxCharacter.height * 0.1, 10, 25);

    robloxCtx.restore();

    // Draw projectiles
    projectiles.forEach((proj, index) => {
        robloxCtx.fillStyle = '#FF6347';
        robloxCtx.beginPath();
        robloxCtx.arc(proj.x, proj.y, 5, 0, Math.PI * 2);
        robloxCtx.fill();

        // Update projectile position
        proj.x += Math.cos((proj.angle * Math.PI) / 180) * 5;
        proj.y += Math.sin((proj.angle * Math.PI) / 180) * 5;

        // Remove if out of bounds
        if (proj.x < 0 || proj.x > robloxCanvas.width || proj.y < 0 || proj.y > robloxCanvas.height) {
            projectiles.splice(index, 1);
        }
    });
}

function animateRobloxCharacter(action, params, callback) {
    const frames = 30;
    let currentFrame = 0;

    const animate = () => {
        if (currentFrame >= frames) {
            if (callback) callback();
            return;
        }

        switch (action) {
            case 'walk':
                robloxCharacter.x += (params.distance / frames) * Math.cos((robloxCharacter.angle * Math.PI) / 180);
                robloxCharacter.y += (params.distance / frames) * Math.sin((robloxCharacter.angle * Math.PI) / 180);
                break;
            case 'run':
                robloxCharacter.x += (params.distance / frames) * Math.cos((robloxCharacter.angle * Math.PI) / 180);
                robloxCharacter.y += (params.distance / frames) * Math.sin((robloxCharacter.angle * Math.PI) / 180);
                break;
            case 'turn':
                robloxCharacter.angle += params.degrees / frames;
                break;
            case 'jump':
                const jumpHeight = 50;
                const progress = currentFrame / frames;
                const jumpOffset = Math.sin(progress * Math.PI) * jumpHeight;
                robloxCharacter.y = params.originalY - jumpOffset;
                break;
        }

        drawRobloxScene();
        currentFrame++;
        requestAnimationFrame(animate);
    };

    animate();
}

// Lua command implementations
function walk(distance) {
    animateRobloxCharacter('walk', { distance: distance });
}

function run(distance) {
    animateRobloxCharacter('run', { distance: distance * 1.5 });
}

function turn(degrees) {
    animateRobloxCharacter('turn', { degrees: degrees });
}

function jump() {
    const originalY = robloxCharacter.y;
    animateRobloxCharacter('jump', { originalY: originalY }, () => {
        robloxCharacter.y = originalY;
    });
}

function shoot() {
    projectiles.push({
        x: robloxCharacter.x,
        y: robloxCharacter.y,
        angle: robloxCharacter.angle
    });

    // Animate projectiles
    const animateProjectiles = () => {
        drawRobloxScene();
        if (projectiles.length > 0) {
            requestAnimationFrame(animateProjectiles);
        }
    };
    animateProjectiles();
}

// ==================== LUA CODE EXECUTION ====================

function runLuaCode(code) {
    if (!luaReady) {
        showNotification('Lua wird geladen... Bitte warte.', 'warning');
        return;
    }

    try {
        // Reset character
        initializeRobloxCanvas();

        // Create Lua environment with custom functions
        const luaEnv = `
            function walk(dist)
                js.global:walk(dist)
            end

            function run(dist)
                js.global:run(dist)
            end

            function turn(deg)
                js.global:turn(deg)
            end

            function jump()
                js.global:jump()
            end

            function shoot()
                js.global:shoot()
            end

            function print(...)
                local args = {...}
                local str = ""
                for i, v in ipairs(args) do
                    str = str .. tostring(v)
                    if i < #args then str = str .. "\\t" end
                end
                js.global.console:log(str)
            end

            ${code}
        `;

        fengari.load(luaEnv)();

        // Check solution
        setTimeout(() => {
            checkSolution(code);
        }, 1000);

    } catch (err) {
        showNotification('Lua Fehler: ' + err.message, 'error');
        console.error('Lua execution error:', err);
    }
}

// ==================== STATISTICS & ACHIEVEMENTS ====================

function updateProgress() {
    const totalLevels = LEVELS_DATA.html.length + LEVELS_DATA.css.length + LEVELS_DATA.python.length + LEVELS_DATA.sql.length + LEVELS_DATA.lua.length;
    const completed = userProgress.stats.totalCompleted;
    const percentage = Math.round((completed / totalLevels) * 100);

    const progressFill = document.getElementById('progressFill');
    progressFill.style.width = percentage + '%';
    progressFill.textContent = `${percentage}% (${completed}/${totalLevels})`;
}

function updateStatistics() {
    document.getElementById('totalCompleted').textContent = userProgress.stats.totalCompleted;
    document.getElementById('totalAttempts').textContent = userProgress.stats.totalAttempts;
    document.getElementById('hintsUsed').textContent = userProgress.stats.hintsUsed;
    document.getElementById('solutionsViewed').textContent = userProgress.stats.solutionsViewed;
}

function loadAchievements() {
    const grid = document.getElementById('achievementsGrid');
    grid.innerHTML = '';

    ACHIEVEMENTS.forEach(achievement => {
        const isUnlocked = achievement.condition(userProgress.stats);

        const card = document.createElement('div');
        card.className = `achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`;
        card.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-title">${achievement.title}</div>
            <div class="achievement-description">${achievement.description}</div>
        `;

        grid.appendChild(card);
    });
}

function checkAchievements() {
    ACHIEVEMENTS.forEach(achievement => {
        if (achievement.condition(userProgress.stats) && !userProgress.unlockedAchievements.includes(achievement.id)) {
            userProgress.unlockedAchievements.push(achievement.id);
            showNotification(`🏆 Achievement freigeschaltet: ${achievement.title}`, 'success');
            playSound('achievement');
        }
    });

    loadAchievements();
}

// ==================== UI UTILITIES ====================

function showModal(title, body) {
    document.getElementById('modalHeader').textContent = title;
    document.getElementById('modalBody').innerHTML = body;
    document.getElementById('modal').classList.add('active');
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
}

function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';

    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.dataset.theme || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    html.dataset.theme = newTheme;
    localStorage.setItem('theme', newTheme);

    // Update theme toggle icon
    document.getElementById('themeToggle').textContent = newTheme === 'dark' ? '☀️' : '🌙';

    // Update editors theme
    const editorTheme = newTheme === 'dark' ? 'monokai' : 'eclipse';
    if (editor) editor.setOption('theme', editorTheme);
    if (freeEditor) freeEditor.setOption('theme', editorTheme);
}

function handleDifficultyFilter(e) {
    const difficulty = e.target.dataset.difficulty;
    const section = e.target.closest('.section');

    // Update active button
    section.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    e.target.classList.add('active');

    // Filter levels
    section.querySelectorAll('.level-card').forEach(card => {
        if (difficulty === 'all') {
            card.style.display = 'block';
        } else {
            const badge = card.querySelector('.difficulty-badge');
            if (badge && badge.classList.contains(`difficulty-${difficulty}`)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        }
    });
}

// ==================== SOUND EFFECTS ====================

function playSound(type) {
    // Using Web Audio API to generate simple beep sounds
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    const sounds = {
        'success': { freq: 800, duration: 0.15 },
        'error': { freq: 200, duration: 0.2 },
        'info': { freq: 600, duration: 0.1 },
        'achievement': { freq: 1000, duration: 0.3 }
    };

    const sound = sounds[type] || sounds.info;

    oscillator.frequency.value = sound.freq;
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + sound.duration);
}

// ==================== UTILITY FUNCTIONS ====================

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// ==================== NOTION INTEGRATION ====================

const BACKEND_URL = 'http://localhost:3000'; // Change to your deployed backend URL

async function sendToNotion() {
    if (!currentUser || !userProgress) return;

    try {
        // Send statistics summary
        const response = await fetch(`${BACKEND_URL}/api/save-statistics`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: currentUser,
                stats: userProgress.stats,
                completedLevels: userProgress.completedLevels
            })
        });

        if (!response.ok) {
            throw new Error('Failed to sync with Notion');
        }

        console.log('Successfully synced to Notion');
    } catch (error) {
        // Silently fail if backend is not available
        console.log('Notion backend not available');
    }
}

async function sendLevelToNotion(levelId) {
    if (!currentUser || !userProgress.levelStats[levelId]) return;

    try {
        const response = await fetch(`${BACKEND_URL}/api/save-progress`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: currentUser,
                levelId: levelId,
                stats: userProgress.levelStats[levelId]
            })
        });

        if (!response.ok) {
            throw new Error('Failed to save level to Notion');
        }
    } catch (error) {
        console.log('Notion backend not available');
    }
}

// ==================== LOAD SAVED THEME ====================

const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.dataset.theme = savedTheme;
document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('themeToggle');
    if (toggleBtn) {
        toggleBtn.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    }
});
