import Link from 'next/link';
import { Plus, MapPin, Settings } from 'lucide-react';

const tutorials = [
  {
    href: '/flohmarkt/tutorials/create-event',
    icon: Plus,
    title: 'Event anlegen',
    description: 'Erstelle dein erstes Event in 5 Minuten'
  },
  {
    href: '/flohmarkt/tutorials/set-highlights',
    icon: MapPin,
    title: 'Highlights für Events setzen',
    description: 'Markiere besondere Orte und Attraktionen auf deiner Karte'
  },
  {
    href: '/flohmarkt/tutorials/configure-event',
    icon: Settings,
    title: 'Events konfigurieren',
    description: 'Passe Spot-Bezeichnungen und Einstellungen an'
  },
];

export default function TutorialsIndexPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Tutorials & Anleitungen</h1>
      <p className="text-gray-800 mb-8">
        Lerne, wie du QuartierSpots optimal nutzt und deine Events erfolgreich verwaltest.
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tutorials.map((tutorial) => {
          const Icon = tutorial.icon;
          return (
            <Link
              key={tutorial.href}
              href={tutorial.href}
              className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 hover:border-[#003366] no-underline group"
            >
              <div className="w-12 h-12 bg-[#003366] rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#002244] transition-colors">
                <Icon className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-lg font-bold text-gray-800 mb-2">{tutorial.title}</h2>
              <p className="text-gray-800 text-sm">{tutorial.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
