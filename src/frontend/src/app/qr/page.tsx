"use client";

import Link from "next/link";
import {
  ArrowRight,
  Monitor,
  Calendar,
  Users,
  Zap,
  CheckCircle,
  QrCode,
  Smartphone,
  Clock,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="text-center">
            {/* TH Nürnberg Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
              Technische Hochschule Nürnberg
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Deine Botschaft,
              <br />
              <span className="text-red-400">sichtbar für alle</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Miete moderne E-Ink Displays an der TH Nürnberg und präsentiere
              deine Anzeigen, Umfragen oder Bachelorarbeit direkt dort, wo deine
              Zielgruppe ist.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Jetzt loslegen
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg hover:bg-white/20 transition-all duration-200 border border-white/20"
              >
                Bereits registriert? Anmelden
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Warum Tablohm?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Erreiche deine Kommilitonen und die Hochschul-Community mit
              professionellen E-Ink Displays
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Feature 1 */}
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl mb-6 group-hover:scale-110 transition-transform duration-200">
                <Monitor className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">
                Moderne E-Ink Displays
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Hochwertige, energieeffiziente E-Ink Bildschirme an
                strategischen Standorten in der TH Nürnberg für maximale
                Sichtbarkeit.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl mb-6 group-hover:scale-110 transition-transform duration-200">
                <Calendar className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">
                Flexible Mietzeiten
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Buche dein Display für Stunden, Tage oder Wochen. Perfekt für
                Events, Präsentationen oder langfristige Kampagnen.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl mb-6 group-hover:scale-110 transition-transform duration-200">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">
                Direkte Zielgruppe
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Erreiche Studierende, Dozenten und Besucher genau dort, wo sie
                täglich vorbeikommen - in den Gängen der Hochschule.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-16 sm:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              So einfach geht's
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              In nur 3 Schritten zu deiner eigenen Anzeige an der TH Nürnberg
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Step 1 */}
            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-red-600 text-white rounded-full font-bold text-lg mb-6">
                  1
                </div>
                <Monitor className="w-12 h-12 text-red-600 mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-4">
                  Display wählen
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Wähle aus verfügbaren E-Ink Displays an verschiedenen
                  Standorten der TH Nürnberg - von Eingangsbereichen bis hin zu
                  Mensen.
                </p>
              </div>
              {/* Connector Arrow */}
              <div className="hidden md:block absolute top-12 left-full w-8 h-0.5 bg-red-200 transform translate-x-4"></div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-red-600 text-white rounded-full font-bold text-lg mb-6">
                  2
                </div>
                <Clock className="w-12 h-12 text-red-600 mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-4">
                  Zeitraum buchen
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Bestimme, wann und wie lange deine Anzeige sichtbar sein soll.
                  Von kurzen Ankündigungen bis zu wochenlangen Kampagnen.
                </p>
              </div>
              {/* Connector Arrow */}
              <div className="hidden md:block absolute top-12 left-full w-8 h-0.5 bg-red-200 transform translate-x-4"></div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-red-600 text-white rounded-full font-bold text-lg mb-6">
                  3
                </div>
                <Zap className="w-12 h-12 text-red-600 mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-4">
                  Content hochladen
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Lade deine Anzeige, Umfrage oder den Link zu deiner
                  Bachelorarbeit hoch und erreiche sofort hunderte von
                  Studierenden.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Perfekt für...
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Use Case Cards */}
            <div className="bg-white rounded-xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow duration-200">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">
                    Bachelorarbeit & Projekte
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    Teile den Link zu deiner Bachelorarbeit, Masterarbeit oder
                    Forschungsprojekt. Lass deine Kommilitonen und Dozenten
                    wissen, woran du arbeitest.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow duration-200">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">
                    Events & Ankündigungen
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    Bewirb deine Veranstaltung, dein Startup oder deine
                    Studiengruppe. Erreiche genau die Menschen, die an der TH
                    Nürnberg unterwegs sind.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow duration-200">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">
                    Umfragen & Feedback
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    Sammle Meinungen für deine Forschung oder dein Projekt.
                    Zeige QR-Codes zu deinen Umfragen und erhalte wertvollen
                    Input.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow duration-200">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">
                    Services & Angebote
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    Biete Nachhilfe, verkaufe Bücher oder bewirb deine
                    Dienstleistungen. Nutze die Hochschul-Community für deine
                    Angebote.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-slate-900 relative">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <QrCode className="w-16 h-16 text-red-400 mx-auto mb-6" />
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 drop-shadow-lg">
              Bereit durchzustarten?
            </h2>
            <p className="text-lg text-slate-200 mb-8 leading-relaxed drop-shadow-md">
              Werde Teil der Tablohm Community und bringe deine Botschaft an die
              TH Nürnberg. Einfach, schnell und effektiv.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Smartphone className="mr-2 w-5 h-5" />
              Kostenloses Konto erstellen
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center px-8 py-4 bg-white/15 backdrop-blur-sm text-white font-semibold rounded-lg hover:bg-white/25 transition-all duration-200 border border-white/30"
            >
              Bereits dabei? Anmelden
            </Link>
          </div>

          <p className="text-sm text-slate-300 mt-6 drop-shadow-sm">
            Für Studierende und Mitarbeiter der TH Nürnberg
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-100 text-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold text-red-600 mb-4">Tablohm</h3>
              <p className="text-slate-700 leading-relaxed">
                Das moderne E-Ink Display Mietsystem für die TH Nürnberg. Deine
                Botschaft, sichtbar für alle.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-slate-900">Quick Links</h4>
              <div className="space-y-2">
                <Link
                  href="/register"
                  className="block text-slate-700 hover:text-red-600 transition-colors duration-200"
                >
                  Registrieren
                </Link>
                <Link
                  href="/login"
                  className="block text-slate-700 hover:text-red-600 transition-colors duration-200"
                >
                  Anmelden
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-slate-900">Support</h4>
              <div className="space-y-2">
                <button className="block text-slate-700 hover:text-red-600 transition-colors duration-200 text-left">
                  Hilfe & FAQ
                </button>
                <button className="block text-slate-700 hover:text-red-600 transition-colors duration-200 text-left">
                  Kontakt
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-300 mt-8 pt-8 text-center">
            <p className="text-slate-600 text-sm">
              © 2024 Technische Hochschule Nürnberg Georg Simon Ohm. Alle Rechte
              vorbehalten.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
