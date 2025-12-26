"use client";

import { useState } from "react";

interface SetPasswordPageProps {
  onComplete: (password: string) => void;
  onBack: () => void;
  username: string;
}

export default function SetPasswordPage({ onComplete, onBack, username }: SetPasswordPageProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password) {
      setError("Bitte gib ein Passwort ein");
      return;
    }

    if (password.length < 6) {
      setError("Das Passwort muss mindestens 6 Zeichen lang sein");
      return;
    }

    if (password !== confirmPassword) {
      setError("Die Passwörter stimmen nicht überein");
      return;
    }

    setIsSubmitting(true);

    try {
      onComplete(password);
    } catch (err) {
      setError("Ein Fehler ist aufgetreten");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#003366] mb-2">
            Hallo {username}! 🔒
          </h1>
          <p className="text-gray-600">
            Setze ein Passwort für dein Konto
          </p>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 opacity-60">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-semibold">
                ✓
              </div>
              <span className="font-medium text-gray-500">Name</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-[#003366] text-white flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <span className="font-medium text-[#003366]">Passwort</span>
            </div>
            <div className="flex items-center space-x-2 opacity-40">
              <div className="w-8 h-8 rounded-full bg-gray-300 text-white flex items-center justify-center text-sm font-semibold">
                3
              </div>
              <span className="font-medium text-gray-500">Organisation</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2">
              Passwort
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md text-base text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-[#003366] focus:border-transparent disabled:bg-gray-100 pr-12"
                placeholder="Mindestens 6 Zeichen"
                autoFocus
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-700 mb-2">
              Passwort bestätigen
            </label>
            <input
              type={showPassword ? "text" : "password"}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md text-base text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-[#003366] focus:border-transparent disabled:bg-gray-100"
              placeholder="Passwort wiederholen"
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 rounded-md p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-800">
              Du erhältst eine Bestätigungs-E-Mail. Bitte bestätige deine E-Mail-Adresse, bevor du dich das nächste Mal mit dem Passwort anmeldest.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onBack}
              disabled={isSubmitting}
              className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-md font-bold hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Zurück
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#003366] text-white py-3 px-4 rounded-md font-bold hover:bg-[#004488] focus:outline-none focus:ring-2 focus:ring-[#003366] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Wird gespeichert..." : "Weiter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
