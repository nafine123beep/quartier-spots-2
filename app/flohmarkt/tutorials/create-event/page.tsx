import { Calendar, MapPin, Image, CheckCircle, ChevronRight } from 'lucide-react';

export default function CreateEventTutorial() {
  return (
    <article className="prose lg:prose-lg max-w-none">
      <h1>Event anlegen</h1>
      <p className="lead text-xl text-gray-800">
        In diesem Tutorial lernst du, wie du in wenigen Schritten ein neues Event erstellst
        und für Teilnehmer veröffentlichst.
      </p>

      <section className="my-8">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-800">
          <Calendar className="inline h-6 w-6 text-[#003366]" />
          Schritt 1: Event-Grunddaten eingeben
        </h2>
        <p>
          Öffne die Event-Erstellung über den Button <strong>"Neues Event"</strong> im Dashboard
          oder in der Event-Übersicht deiner Organisation.
        </p>
        <div className="bg-gray-100 p-4 rounded-lg my-4 not-prose">
          <h3 className="text-sm font-bold mb-2 text-gray-800">Wichtige Felder:</h3>
          <ul className="text-sm text-gray-800 space-y-1">
            <li><strong>Titel:</strong> Kurzer, prägnanter Name (z.B. "Hofflohmarkt Nordstadt 2026")</li>
            <li><strong>Beschreibung:</strong> Details zum Event (optional, aber empfohlen)</li>
            <li><strong>Start-Zeit:</strong> Wann beginnt das Event?</li>
            <li><strong>End-Zeit:</strong> Wann endet das Event?</li>
          </ul>
        </div>
      </section>

      <section className="my-8">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-800">
          <MapPin className="inline h-6 w-6 text-[#003366]" />
          Schritt 2: Kartenzentrum festlegen
        </h2>
        <p>
          Gib die zentrale Adresse deines Events ein. Diese wird als Mittelpunkt der Karte verwendet
          und hilft Teilnehmern, das Event zu finden.
        </p>
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-4">
          <p className="text-blue-800 mb-0">
            <strong>Tipp:</strong> Wähle eine zentrale Adresse in deinem Veranstaltungsbereich,
            z.B. einen bekannten Platz oder eine Hauptstraße.
          </p>
        </div>
      </section>

      <section className="my-8">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-800">
          <Image className="inline h-6 w-6 text-[#003366]" />
          Schritt 3: Cover-Bild hochladen (Optional)
        </h2>
        <p>
          Füge ein ansprechendes Bild hinzu, das auf der Event-Karte und im Dashboard angezeigt wird.
          Ein gutes Bild macht dein Event attraktiver!
        </p>
        <ul>
          <li>Unterstützte Formate: JPG, PNG, WebP</li>
          <li>Maximale Dateigröße: 5 MB</li>
          <li>Empfohlenes Format: 16:9 (Querformat)</li>
        </ul>
      </section>

      <section className="my-8">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-800">
          <CheckCircle className="inline h-6 w-6 text-[#003366]" />
          Schritt 4: Event erstellen
        </h2>
        <p>
          Klicke auf <strong>"Event erstellen"</strong>. Dein Event ist jetzt aktiv und öffentlich
          zugänglich. Teilnehmer können ab sofort Spots registrieren!
        </p>
      </section>

      <div className="bg-green-50 border-l-4 border-green-400 p-4 my-6">
        <h3 className="text-green-800 font-bold mt-0 text-lg">Geschafft!</h3>
        <p className="text-green-800 mb-0">
          Dein Event ist jetzt erstellt. Du kannst es jederzeit bearbeiten, Highlights hinzufügen
          oder archivieren. Viel Erfolg mit deinem Event!
        </p>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-bold text-gray-800">Nächste Schritte</h3>
        <ul className="space-y-2">
          <li>
            <a href="/flohmarkt/tutorials/set-highlights" className="text-[#003366] hover:underline inline-flex items-center gap-1">
              <ChevronRight className="h-4 w-4" aria-hidden="true" /> Highlights für Events setzen
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
