import { Star, MapPin, Plus, Edit, ChevronRight } from 'lucide-react';

export default function SetHighlightsTutorial() {
  return (
    <article className="prose lg:prose-lg max-w-none">
      <h1 className="text-gray-900">Highlights für Events setzen</h1>
      <p className="lead text-xl text-gray-800">
        Highlights sind besondere Orte auf deiner Event-Karte, die du hervorheben möchtest —
        wie Toiletten, Getränkestände, Infopoints oder besondere Attraktionen.
      </p>

      <section className="my-8">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-800">
          <Star className="inline h-6 w-6 text-[#003366]" />
          Was sind Highlights?
        </h2>
        <p className="text-gray-900">
          Highlights unterscheiden sich von normalen Spots: Sie werden von dir als Organisator
          erstellt und zeigen wichtige Orte, die alle Teilnehmer sehen sollten.
        </p>
        <div className="bg-gray-100 p-4 rounded-lg my-4 not-prose">
          <h3 className="text-sm font-bold mb-2 text-gray-800">Beispiele für Highlights:</h3>
          <ul className="text-sm text-gray-800 space-y-1">
            <li>🚻 Toiletten</li>
            <li>🍺 Getränkestände</li>
            <li>ℹ️ Informationspunkte</li>
            <li>🅿️ Parkplätze</li>
            <li>🎪 Besondere Attraktionen</li>
          </ul>
        </div>
      </section>

      <section className="my-8">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-800">
          <Plus className="inline h-6 w-6 text-[#003366]" />
          Highlights hinzufügen
        </h2>
        <p className="text-gray-900">
          Um ein Highlight hinzuzufügen:
        </p>
        <ol className="space-y-2 text-gray-900">
          <li>Öffne dein Event im Dashboard</li>
          <li>Wechsle zum Tab <strong>"Highlights"</strong></li>
          <li>Klicke auf <strong>"Highlight hinzufügen"</strong></li>
          <li>Gib die Adresse oder Position ein</li>
          <li>Wähle einen Highlight-Typ (oder erstelle einen eigenen)</li>
          <li>Optional: Füge eine Beschreibung hinzu</li>
          <li>Speichern!</li>
        </ol>
      </section>

      <section className="my-8">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-800">
          <Edit className="inline h-6 w-6 text-[#003366]" />
          Eigene Highlight-Typen erstellen
        </h2>
        <p className="text-gray-900">
          Du kannst auch eigene Highlight-Typen mit individuellen Icons und Bezeichnungen erstellen:
        </p>
        <ol className="space-y-2 text-gray-900">
          <li>Im Highlights-Tab auf <strong>"Neuer Typ"</strong> klicken</li>
          <li>Bezeichnung eingeben (z.B. "Kinderspielplatz")</li>
          <li>Icon auswählen (Emoji oder Text)</li>
          <li>Speichern</li>
        </ol>
        <p className="text-gray-900">
          Dieser Typ steht dann für alle Highlights in diesem Event zur Verfügung.
        </p>
      </section>

      <section className="my-8">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-800">
          <MapPin className="inline h-6 w-6 text-[#003366]" />
          Highlights auf der Karte
        </h2>
        <p className="text-gray-900">
          Highlights werden auf der öffentlichen Event-Karte mit speziellen Icons angezeigt
          und heben sich optisch von normalen Spots ab. So finden Teilnehmer wichtige Orte sofort!
        </p>
      </section>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-6">
        <h3 className="text-blue-800 font-bold mt-0 text-lg">Best Practice</h3>
        <p className="text-blue-800 mb-0">
          Füge Highlights schon vor dem Event hinzu, damit Teilnehmer bei der Anmeldung sehen,
          wo sich wichtige Orte befinden. Das verbessert die Orientierung und das Event-Erlebnis!
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
            <a href="/flohmarkt/tutorials/configure-event" className="text-[#003366] hover:underline inline-flex items-center gap-1">
              <ChevronRight className="h-4 w-4" aria-hidden="true" /> Events konfigurieren
            </a>
          </li>
        </ul>
      </div>
    </article>
  );
}
