import { Settings, Type, MapIcon, Archive, ChevronRight } from 'lucide-react';

export default function ConfigureEventTutorial() {
  return (
    <article className="prose lg:prose-lg max-w-none [--tw-prose-body:#1f2937] [--tw-prose-counters:#1f2937] [--tw-prose-bullets:#1f2937]">
      <h1>Events konfigurieren</h1>
      <p className="lead text-xl text-gray-800">
        Passe dein Event an deine Bedürfnisse an: von benutzerdefinierten Bezeichnungen
        bis hin zu Karteneinstellungen.
      </p>

      <section className="my-8">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-800">
          <Type className="inline h-6 w-6 text-[#003366]" />
          Spot-Bezeichnungen anpassen
        </h2>
        <p>
          Standardmäßig werden Teilnehmer-Einträge als "Spots" bezeichnet. Du kannst diese
          Bezeichnung ändern, um sie an dein Event anzupassen.
        </p>
        <div className="bg-gray-100 p-4 rounded-lg my-4 not-prose">
          <h3 className="text-sm font-bold mb-2 text-gray-800">Beispiele:</h3>
          <ul className="text-sm text-gray-800 space-y-1">
            <li>Flohmarkt: "Stand" / "Stände"</li>
            <li>Food-Festival: "Tisch" / "Tische"</li>
            <li>Straßenfest: "Platz" / "Plätze"</li>
            <li>Kunstmarkt: "Ausstellungsfläche" / "Ausstellungsflächen"</li>
          </ul>
        </div>
        <p>
          Die Bezeichnung wird überall in der App verwendet: in Formularen, Listen und auf der Karte.
        </p>
        <h3>So passt du die Bezeichnung an:</h3>
        <ol className="space-y-2">
          <li>Öffne dein Event</li>
          <li>Gehe zum Tab <strong>"Einstellungen"</strong></li>
          <li>Unter <strong>"Spot-Bezeichnung"</strong> kannst du Singular und Plural festlegen</li>
          <li>Speichern!</li>
        </ol>
      </section>

      <section className="my-8">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-800">
          <MapIcon className="inline h-6 w-6 text-[#003366]" />
          Kartenzentrum und Radius anpassen
        </h2>
        <p>
          Das Kartenzentrum bestimmt, wo die Karte zentriert wird. Der Grenzradius definiert,
          wie weit Teilnehmer von diesem Zentrum entfernt Spots anmelden können.
        </p>
        <h3>Kartenzentrum ändern:</h3>
        <ol className="space-y-2">
          <li>Event-Einstellungen öffnen</li>
          <li>Neue zentrale Adresse eingeben</li>
          <li>System findet automatisch die Koordinaten</li>
        </ol>
        <h3>Grenzradius festlegen:</h3>
        <p>
          Optional kannst du einen Radius in Metern festlegen. Spot-Anmeldungen außerhalb
          dieses Bereichs werden abgelehnt. Nützlich für lokale Events mit definiertem Gebiet.
        </p>
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-4">
          <p className="text-blue-800 mb-0">
            <strong>Tipp:</strong> Lasse den Radius leer, wenn dein Event über ein
            größeres Gebiet verteilt ist oder du keine Begrenzung möchtest.
          </p>
        </div>
      </section>

      <section className="my-8">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-800">
          <Archive className="inline h-6 w-6 text-[#003366]" />
          Event archivieren
        </h2>
        <p>
          Nach dem Event kannst du es archivieren. Archivierte Events:
        </p>
        <ul>
          <li>Sind weiterhin sichtbar für Mitglieder (nur ansehen)</li>
          <li>Erlauben keine neuen Spot-Anmeldungen</li>
          <li>Bleiben als Referenz für zukünftige Events erhalten</li>
          <li>Können reaktiviert werden, falls nötig</li>
        </ul>
        <p>
          Um ein Event zu archivieren, öffne es und klicke auf <strong>"Archivieren"</strong>
          im Einstellungen-Tab.
        </p>
      </section>

      <section className="my-8">
        <h2 className="text-2xl font-bold text-gray-800">Weitere Einstellungen</h2>
        <h3>Event bearbeiten:</h3>
        <p>
          Du kannst jederzeit Titel, Beschreibung, Zeiten und Cover-Bild deines Events ändern.
          Änderungen sind sofort sichtbar.
        </p>
        <h3>Event löschen:</h3>
        <p>
          Events können nur von Admins gelöscht werden. Gelöschte Events können nicht
          wiederhergestellt werden. Verwende stattdessen "Archivieren", um Events
          zu behalten aber zu deaktivieren.
        </p>
      </section>

      <div className="bg-green-50 border-l-4 border-green-400 p-4 my-6">
        <h3 className="text-green-800 font-bold mt-0 text-lg">Wichtig zu wissen</h3>
        <p className="text-green-800 mb-0">
          Alle Einstellungen können jederzeit geändert werden, ohne bestehende Spot-Anmeldungen
          zu beeinträchtigen. Experimentiere ruhig, um die beste Konfiguration für dein Event zu finden!
        </p>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-bold text-gray-800">Nächste Schritte</h3>
        <ul className="space-y-2">
          <li>
            <a href="/flohmarkt/tutorials/create-event" className="text-[#003366] hover:underline inline-flex items-center gap-1">
              <ChevronRight className="h-4 w-4" aria-hidden="true" /> Event anlegen
            </a>
          </li>
          <li>
            <a href="/flohmarkt/tutorials/set-highlights" className="text-[#003366] hover:underline inline-flex items-center gap-1">
              <ChevronRight className="h-4 w-4" aria-hidden="true" /> Highlights für Events setzen
            </a>
          </li>
        </ul>
      </div>
    </article>
  );
}
