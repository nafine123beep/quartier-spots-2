"use client";

import Link from "next/link";
import { Plus, MapPin, Settings, ChevronRight } from "lucide-react";

const TUTORIALS = [
  {
    id: 'create-event',
    title: 'Event anlegen',
    description: 'Erstelle dein erstes Event in 5 Minuten',
    icon: Plus,
    href: '/flohmarkt/tutorials/create-event',
  },
  {
    id: 'set-highlights',
    title: 'Highlights für Events setzen',
    description: 'Markiere besondere Orte und Attraktionen auf deiner Karte',
    icon: MapPin,
    href: '/flohmarkt/tutorials/set-highlights',
  },
  {
    id: 'configure-event',
    title: 'Events konfigurieren',
    description: 'Passe Spot-Bezeichnungen und Einstellungen an',
    icon: Settings,
    href: '/flohmarkt/tutorials/configure-event',
  },
];

interface TutorialCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

function TutorialCard({ title, description, icon: Icon, href }: TutorialCardProps) {
  return (
    <Link
      href={href}
      className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 hover:border-[#003366] no-underline group"
    >
      <div className="w-12 h-12 bg-[#003366] rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#002244] transition-colors">
        <Icon className="h-6 w-6 text-white" />
      </div>
      <h3 className="text-lg font-bold text-gray-800 mb-2 m-0">{title}</h3>
      <p className="text-gray-800 text-sm mb-3">{description}</p>
      <div className="text-[#003366] text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
        Starten <ChevronRight className="h-4 w-4" />
      </div>
    </Link>
  );
}

export function TutorialsSection() {
  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Tutorials & Hilfe</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TUTORIALS.map(tutorial => (
          <TutorialCard key={tutorial.id} {...tutorial} />
        ))}
      </div>
    </section>
  );
}
