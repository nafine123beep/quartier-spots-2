"use client";

import Link from "next/link";

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#003366] text-white p-5 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link
            href="/flohmarkt"
            className="text-2xl text-white hover:text-[#FFCC00] no-underline transition-colors"
          >
            ←
          </Link>
          <h1 className="text-2xl font-bold m-0">Impressum & Datenschutz</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-5 md:p-8">
        {/* Impressum Section */}
        <section className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-8">
          <h2 className="text-3xl font-bold text-[#003366] mb-6 border-b-2 border-[#FFCC00] pb-2">
            Impressum
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Angaben gemäß § 5 TMG</h3>
              <p className="text-gray-700 leading-relaxed">
                Meratio GmbH & Co. KG<br />
                Bernricht 1 ¾<br />
                92224 Amberg<br />
                Deutschland
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Vertreten durch</h3>
              <p className="text-gray-700 leading-relaxed">
                Vertreten durch die Komplementärin:<br />
                Meratio Verwaltungs GmbH
              </p>
              <p className="text-gray-700 leading-relaxed mt-2">
                Geschäftsführer:<br />
                Christian Bullik<br />
                Benjamin Franta<br />
                Florian Müller<br />
                Lukas Schwethelm<br />
                Philipp Simon
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Kontakt</h3>
              <p className="text-gray-700 leading-relaxed">
                Telefon: <a href="tel:+4996216730650" className="text-[#003366] hover:underline">+49 9621 673065</a><br />
                E-Mail: <a href="mailto:info@meratio.de" className="text-[#003366] hover:underline">info@meratio.de</a>
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Registereintrag</h3>
              <p className="text-gray-700 leading-relaxed">
                Eintragung im Handelsregister<br />
                Registergericht: Amtsgericht Amberg<br />
                Registernummer: HRB 6428
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Umsatzsteuer-ID</h3>
              <p className="text-gray-700 leading-relaxed">
                Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br />
                DE323589688
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h3>
              <p className="text-gray-700 leading-relaxed">
                Meratio GmbH & Co. KG<br />
                Bernricht 1 ¾<br />
                92224 Amberg
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Haftungsausschluss</h3>

              <h4 className="font-bold text-gray-800 mt-4 mb-2">Haftung für Inhalte</h4>
              <p className="text-gray-700 leading-relaxed">
                Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit,
                Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.
                Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten
                nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als
                Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
                Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige
                Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von
                Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche
                Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung
                möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte
                umgehend entfernen.
              </p>

              <h4 className="font-bold text-gray-800 mt-4 mb-2">Haftung für Links</h4>
              <p className="text-gray-700 leading-relaxed">
                Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen
                Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen.
                Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der
                Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf
                mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung
                nicht erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne
                konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von
                Rechtsverletzungen werden wir derartige Links umgehend entfernen.
              </p>

              <h4 className="font-bold text-gray-800 mt-4 mb-2">Urheberrecht</h4>
              <p className="text-gray-700 leading-relaxed">
                Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen
                dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art
                der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen
                Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind
                nur für den privaten, nicht kommerziellen Gebrauch gestattet. Soweit die Inhalte auf dieser
                Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet.
                Insbesondere werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf eine
                Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei
                Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.
              </p>
            </div>
          </div>
        </section>

        {/* Datenschutz Section */}
        <section className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-8">
          <h2 className="text-3xl font-bold text-[#003366] mb-6 border-b-2 border-[#FFCC00] pb-2">
            Datenschutzerklärung
          </h2>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <p className="text-blue-900 font-medium">
              ℹ️ Diese Datenschutzerklärung ist eine Vorlage und wird noch mit den spezifischen
              Informationen ergänzt.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">1. Datenschutz auf einen Blick</h3>

              <h4 className="font-bold text-gray-800 mt-4 mb-2">Allgemeine Hinweise</h4>
              <p className="text-gray-700 leading-relaxed">
                Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren
                personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten
                sind alle Daten, mit denen Sie persönlich identifiziert werden können. Ausführliche
                Informationen zum Thema Datenschutz entnehmen Sie unserer unter diesem Text aufgeführten
                Datenschutzerklärung.
              </p>

              <h4 className="font-bold text-gray-800 mt-4 mb-2">Datenerfassung auf dieser Website</h4>
              <p className="text-gray-700 leading-relaxed mb-2">
                <strong>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong>
              </p>
              <p className="text-gray-700 leading-relaxed">
                Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen
                Kontaktdaten können Sie dem Impressum dieser Website entnehmen.
              </p>

              <p className="text-gray-700 leading-relaxed mb-2 mt-4">
                <strong>Wie erfassen wir Ihre Daten?</strong>
              </p>
              <p className="text-gray-700 leading-relaxed">
                Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann
                es sich z.B. um Daten handeln, die Sie in ein Kontaktformular eingeben. Andere Daten
                werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website durch unsere
                IT-Systeme erfasst. Das sind vor allem technische Daten (z.B. Internetbrowser,
                Betriebssystem oder Uhrzeit des Seitenaufrufs). Die Erfassung dieser Daten erfolgt
                automatisch, sobald Sie diese Website betreten.
              </p>

              <p className="text-gray-700 leading-relaxed mb-2 mt-4">
                <strong>Wofür nutzen wir Ihre Daten?</strong>
              </p>
              <p className="text-gray-700 leading-relaxed">
                Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der Website zu
                gewährleisten. Andere Daten können zur Analyse Ihres Nutzerverhaltens verwendet werden.
              </p>

              <p className="text-gray-700 leading-relaxed mb-2 mt-4">
                <strong>Welche Rechte haben Sie bezüglich Ihrer Daten?</strong>
              </p>
              <p className="text-gray-700 leading-relaxed">
                Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und Zweck
                Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht, die
                Berichtigung oder Löschung dieser Daten zu verlangen. Wenn Sie eine Einwilligung zur
                Datenverarbeitung erteilt haben, können Sie diese Einwilligung jederzeit für die Zukunft
                widerrufen. Außerdem haben Sie das Recht, unter bestimmten Umständen die Einschränkung der
                Verarbeitung Ihrer personenbezogenen Daten zu verlangen. Des Weiteren steht Ihnen ein
                Beschwerderecht bei der zuständigen Aufsichtsbehörde zu.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">2. Hosting</h3>
              <p className="text-gray-700 leading-relaxed">
                Wir hosten die Inhalte unserer Website bei folgendem Anbieter: [Details werden noch ergänzt]
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">3. Allgemeine Hinweise und Pflichtinformationen</h3>

              <h4 className="font-bold text-gray-800 mt-4 mb-2">Datenschutz</h4>
              <p className="text-gray-700 leading-relaxed">
                Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir
                behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen
                Datenschutzvorschriften sowie dieser Datenschutzerklärung.
              </p>
              <p className="text-gray-700 leading-relaxed mt-2">
                Wenn Sie diese Website benutzen, werden verschiedene personenbezogene Daten erhoben.
                Personenbezogene Daten sind Daten, mit denen Sie persönlich identifiziert werden können.
                Die vorliegende Datenschutzerklärung erläutert, welche Daten wir erheben und wofür wir sie
                nutzen. Sie erläutert auch, wie und zu welchem Zweck das geschieht.
              </p>
              <p className="text-gray-700 leading-relaxed mt-2">
                Wir weisen darauf hin, dass die Datenübertragung im Internet (z.B. bei der Kommunikation
                per E-Mail) Sicherheitslücken aufweisen kann. Ein lückenloser Schutz der Daten vor dem
                Zugriff durch Dritte ist nicht möglich.
              </p>

              <h4 className="font-bold text-gray-800 mt-4 mb-2">Hinweis zur verantwortlichen Stelle</h4>
              <p className="text-gray-700 leading-relaxed">
                Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:
              </p>
              <p className="text-gray-700 leading-relaxed mt-2">
                Meratio GmbH & Co. KG<br />
                Bernricht 1 ¾<br />
                92224 Amberg<br />
                Deutschland
              </p>
              <p className="text-gray-700 leading-relaxed mt-2">
                Telefon: <a href="tel:+4996216730650" className="text-[#003366] hover:underline">+49 9621 673065</a><br />
                E-Mail: <a href="mailto:info@meratio.de" className="text-[#003366] hover:underline">info@meratio.de</a>
              </p>
              <p className="text-gray-700 leading-relaxed mt-2">
                Verantwortliche Stelle ist die natürliche oder juristische Person, die allein oder gemeinsam
                mit anderen über die Zwecke und Mittel der Verarbeitung von personenbezogenen Daten (z.B.
                Namen, E-Mail-Adressen o. Ä.) entscheidet.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">4. Datenerfassung auf dieser Website</h3>
              <p className="text-gray-700 leading-relaxed">
                [Weitere Details zur Datenerfassung werden noch ergänzt]
              </p>
            </div>

            <div className="mt-8 p-4 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-600 italic">
                Stand dieser Datenschutzerklärung: {new Date().toLocaleDateString('de-DE', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </section>

        {/* Back Link */}
        <div className="text-center">
          <Link
            href="/flohmarkt"
            className="inline-block bg-[#003366] text-white px-6 py-3 rounded-md font-bold hover:bg-[#002244] transition-colors no-underline"
          >
            Zurück zur Startseite
          </Link>
        </div>
      </div>
    </div>
  );
}
