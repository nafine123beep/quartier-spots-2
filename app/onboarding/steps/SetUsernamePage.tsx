"use client";

import { useState } from "react";

interface SetUsernamePageProps {
  onComplete: (username: string) => void;
  initialEmail?: string;
}

export default function SetUsernamePage({ onComplete, initialEmail }: SetUsernamePageProps) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("Bitte gib einen Namen ein");
      return;
    }

    if (username.trim().length < 2) {
      setError("Der Name muss mindestens 2 Zeichen lang sein");
      return;
    }

    setIsSubmitting(true);

    try {
      onComplete(username.trim());
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
            Willkommen! 👋
          </h1>
          <p className="text-gray-600">
            Lass uns dein Konto einrichten
          </p>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-[#003366] text-white flex items-center justify-center text-sm font-semibold">
                1
              </div>
              <span className="font-medium text-[#003366]">Name</span>
            </div>
            <div className="flex items-center space-x-2 opacity-40">
              <div className="w-8 h-8 rounded-full bg-gray-300 text-white flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <span className="font-medium text-gray-500">Passwort</span>
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
          {initialEmail && (
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-800">
                <span className="font-medium">E-Mail:</span> {initialEmail}
              </p>
            </div>
          )}

          <div>
            <label htmlFor="username" className="block text-sm font-bold text-gray-700 mb-2">
              Wie möchtest du genannt werden?
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md text-base text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-[#003366] focus:border-transparent disabled:bg-gray-100"
              placeholder="Dein Name"
              autoFocus
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 rounded-md p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#003366] text-white py-3.5 px-4 rounded-md text-lg font-bold hover:bg-[#004488] focus:outline-none focus:ring-2 focus:ring-[#003366] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "Wird gespeichert..." : "Weiter"}
          </button>
        </form>
      </div>
    </div>
  );
}
