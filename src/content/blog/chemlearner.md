---
title: "ChemLearner"
pubDate: 2025-03-01T11:33:00+02:00
draft: false
tags: ["", ""]
categories: ["Posts"]
description: ""
coverImageCredit: ''
---

<br>
In Chemie mussten wir letzte Woche verschiedene Formeln von Säuren und Basen lernen. Es war eh nicht sehr schwer und ich habe auch alle gewusst. Ich habe mir aber gedacht, dass es doch cool wäre, wenn ich für die Zukunft ein Programm hätte, dass mich das, was ich lernen muss, abfragen kann. Und deswegen habe ich dann *ChemLearner* gemacht!
</br>

#### Was ist ChemLearner überhaupt?
ChemLearner ist eine Webapplikation, die ich, mein Vater und Claude Code zusammen gemacht haben. Aber Claude hat auch wirklich wenig gemacht. Fast gar nichts... ... Okay. Eigentlich hat Claude Code 99% der Arbeit gemacht. Die restlichen 1% waren die Prompts schreiben und auf "yes" klicken, wenn er fragt, ob er irgendwelche Commands ausführen darf. Nein warte, den Plan haben ja wir geschriebe--ähm... Das haben wir auch mit KI gemacht... 

#### Weg zur Webapp

Wir haben zuerst einmal Google Gemini gefragt, ein README zu erstellen, wo steht, wie wir es haben wollen. Claude kann mit diesem Readme dann weiterarbeiten. Wir haben Claude Code diesen README gegeben und er hat einen genaueren Implementationsplan heraugearbeitet mit verschiedenen Phasen und sonst wichtige Dinge wie Aufbau der Webapp. Wir mussten dann nur mehr die einzelnen Phasen initialisieren und dazu schreiben, falls etwas einen Fehler gab oder wir noch etwas hinzufügen wollten.

Es gab ziemlich lange ein Problem mit dem 3D-Rendering. Bei chemischen Formeln kann es vorkommen, dass sie "ambiguous" sind, also mehrdeutig. Deshalb haben wir am Ende einfach SMILES hinzugefügt, die die chemische Struktur genauer beschreiben und es deshalb auch keine doppeldeutigen Formeln geben kann.

#### Vorteile & Nachteile

Es ist aber schon erstaunlich, was man alles mit Künstlicher Intelligenz machen kann! Wir hätten wahrscheinlich Monate an dem ChemLearner-Projekt gesessen und jetzt haben wir es in... *zwei Wochen* fertig! Ganz fertig noch nicht, es gibt sicher noch irgendwo Bugs. Das sind dann aber auch nur Kleinigkeiten, im Großen und Ganzen ist es fertig. Und es ging wirklich schnell. Schon nach ein paar Tagen daran arbeiten hatten wir das ganze Interface und die Liste mit den Verbindungen.

Früher musste man viele Stunden an so einem Projekt sitzen. Und das war nicht einmal ein sehr großes Projekt. Jetzt kann man das mit KI viel einfacher und schneller machen.

Das Coole ist, dass ich nicht einmal das machen muss, die SMILES und sonstige Infos heraussuchen. Das macht auch alles Claude. Ich gebe ihm eine Liste mit den Elemementen, die ich hinzugefügt haben will und er sucht mir alles heraus. In einer vorherigen Version der Webapp hatte wir noch "Edit" und "Add" Buttons, aber die hinzugefügten Moleküle wären dann nur im lokalen Browserspeicher und das bringt dann auch nicht sehr viel. Deshalb müssen wir so oder so alle neuen Verbindungen über Claude direkt in den Code hineinschreiben.

Das ist gleichzeitig auch ein Nachteil. Man ist sehr von der KI abhängig. Selbst wenn man nur eine kleine Änderung machen will, muss man es mit Coding Agent machen.