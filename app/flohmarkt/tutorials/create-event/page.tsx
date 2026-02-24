"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Calendar, MapPin, Image, CheckCircle, ChevronRight } from "lucide-react";
import { TutorialStepper, type TutorialStep } from "../components/TutorialStepper";

const STEPS: TutorialStep[] = [
  { id: "grunddaten", label: "Grunddaten", icon: Calendar },
  { id: "karten-zentrum", label: "Karten-Zentrum", icon: MapPin },
  { id: "cover-bild", label: "Cover-Bild", icon: Image },
  { id: "veroeffentlichen", label: "Veröffentlichen", icon: CheckCircle },
];

export default function CreateEventTutorial() {
  const [activeStep, setActiveStep] = useState(0);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const isScrollingRef = useRef(false);

  const setSectionRef = useCallback(
    (index: number) => (el: HTMLElement | null) => {
      sectionRefs.current[index] = el;
    },
    []
  );

  // Track which section is visible using IntersectionObserver
  useEffect(() => {
    const sections = sectionRefs.current.filter(Boolean) as HTMLElement[];
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingRef.current) return;

        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = sections.indexOf(entry.target as HTMLElement);
            if (index !== -1) {
              setActiveStep(index);
            }
          }
        }
      },
      {
        rootMargin: "-20% 0px -60% 0px",
        threshold: 0.1,
      }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const scrollToStep = useCallback((index: number) => {
    const section = sectionRefs.current[index];
    if (!section) return;

    isScrollingRef.current = true;
    setActiveStep(index);

    section.scrollIntoView({ behavior: "smooth", block: "start" });

    // Re-enable observer after scroll completes
    setTimeout(() => {
      isScrollingRef.current = false;
    }, 800);
  }, []);

  return (
    <div>
      {/* Sticky stepper bar */}
      <div className="sticky top-0 z-10 bg-gray-50 -mx-6 px-6 pt-4 pb-3 border-b border-gray-200">
        <TutorialStepper
          steps={STEPS}
          activeIndex={activeStep}
          onStepClick={scrollToStep}
        />
      </div>

      {/* Title + lead */}
      <h1 className="text-3xl font-bold text-gray-900 mt-6 mb-2">Event anlegen</h1>
      <p className="text-lg text-gray-800 mb-8">
        In diesem Tutorial lernst du, wie du in wenigen Schritten ein neues Event erstellst
        und für Teilnehmer veröffentlichst.
      </p>

      {/* Step 1: Grunddaten */}
      <section
        id="grunddaten"
        ref={setSectionRef(0)}
        className="scroll-mt-24 mb-10 bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-4">
          <span className="w-10 h-10 rounded-full bg-[#003366] flex items-center justify-center shrink-0">
            <Calendar className="h-5 w-5 text-white" aria-hidden="true" />
          </span>
          <h2 className="text-xl font-bold text-gray-900 m-0">
            Schritt 1: Event-Grunddaten eingeben
          </h2>
        </div>
        <p className="text-gray-900 mb-4">
          Öffne die Event-Erstellung über den Button <strong>&quot;Neues Event&quot;</strong> im Dashboard
          oder in der Event-Übersicht deiner Organisation.
        </p>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
          <h3 className="text-sm font-bold mb-2 text-gray-800">Wichtige Felder:</h3>
          <ul className="text-sm text-gray-800 space-y-1.5 list-none m-0 p-0">
            <li><strong>Titel:</strong> Kurzer, prägnanter Name (z.B. &quot;Hofflohmarkt Nordstadt 2026&quot;)</li>
            <li><strong>Beschreibung:</strong> Details zum Event (optional, aber empfohlen)</li>
            <li><strong>Start-Zeit:</strong> Wann beginnt das Event?</li>
            <li><strong>End-Zeit:</strong> Wann endet das Event?</li>
          </ul>
        </div>
      </section>

      {/* Step 2: Karten-Zentrum */}
      <section
        id="karten-zentrum"
        ref={setSectionRef(1)}
        className="scroll-mt-24 mb-10 bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-4">
          <span className="w-10 h-10 rounded-full bg-[#003366] flex items-center justify-center shrink-0">
            <MapPin className="h-5 w-5 text-white" aria-hidden="true" />
          </span>
          <h2 className="text-xl font-bold text-gray-900 m-0">
            Schritt 2: Kartenzentrum festlegen
          </h2>
        </div>
        <p className="text-gray-900 mb-4">
          Gib die zentrale Adresse deines Events ein. Diese wird als Mittelpunkt der Karte verwendet
          und hilft Teilnehmern, das Event zu finden.
        </p>
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
          <p className="text-blue-900 m-0">
            <strong>Tipp:</strong> Wähle eine zentrale Adresse in deinem Veranstaltungsbereich,
            z.B. einen bekannten Platz oder eine Hauptstraße.
          </p>
        </div>
      </section>

      {/* Step 3: Cover-Bild */}
      <section
        id="cover-bild"
        ref={setSectionRef(2)}
        className="scroll-mt-24 mb-10 bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-4">
          <span className="w-10 h-10 rounded-full bg-[#003366] flex items-center justify-center shrink-0">
            <Image className="h-5 w-5 text-white" aria-hidden="true" />
          </span>
          <h2 className="text-xl font-bold text-gray-900 m-0">
            Schritt 3: Cover-Bild hochladen (Optional)
          </h2>
        </div>
        <p className="text-gray-900 mb-4">
          Füge ein ansprechendes Bild hinzu, das auf der Event-Karte und im Dashboard angezeigt wird.
          Ein gutes Bild macht dein Event attraktiver!
        </p>
        <ul className="text-gray-900 space-y-1.5 list-none m-0 p-0">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#003366] shrink-0" aria-hidden="true" />
            Unterstützte Formate: JPG, PNG, WebP
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#003366] shrink-0" aria-hidden="true" />
            Maximale Dateigröße: 5 MB
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#003366] shrink-0" aria-hidden="true" />
            Empfohlenes Format: 16:9 (Querformat)
          </li>
        </ul>
      </section>

      {/* Step 4: Veröffentlichen */}
      <section
        id="veroeffentlichen"
        ref={setSectionRef(3)}
        className="scroll-mt-24 mb-10 bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-4">
          <span className="w-10 h-10 rounded-full bg-[#003366] flex items-center justify-center shrink-0">
            <CheckCircle className="h-5 w-5 text-white" aria-hidden="true" />
          </span>
          <h2 className="text-xl font-bold text-gray-900 m-0">
            Schritt 4: Event erstellen
          </h2>
        </div>
        <p className="text-gray-900">
          Klicke auf <strong>&quot;Event erstellen&quot;</strong>. Dein Event ist jetzt aktiv und öffentlich
          zugänglich. Teilnehmer können ab sofort Spots registrieren!
        </p>
      </section>

      {/* Success box */}
      <div className="bg-green-50 border-l-4 border-green-500 p-5 rounded-r-lg mb-8">
        <h3 className="text-green-800 font-bold mt-0 text-lg mb-1">Geschafft!</h3>
        <p className="text-green-800 m-0">
          Dein Event ist jetzt erstellt. Du kannst es jederzeit bearbeiten, Highlights hinzufügen
          oder archivieren. Viel Erfolg mit deinem Event!
        </p>
      </div>

      {/* Next steps */}
      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-3">Nächste Schritte</h3>
        <ul className="space-y-2 list-none m-0 p-0">
          <li>
            <a
              href="/flohmarkt/tutorials/set-highlights"
              className="text-[#003366] hover:underline inline-flex items-center gap-1 font-medium"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" /> Highlights für Events setzen
            </a>
          </li>
          <li>
            <a
              href="/flohmarkt/tutorials/configure-event"
              className="text-[#003366] hover:underline inline-flex items-center gap-1 font-medium"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" /> Events konfigurieren
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
