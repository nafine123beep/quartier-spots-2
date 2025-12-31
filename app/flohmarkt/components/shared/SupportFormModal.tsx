"use client";

import { useState } from "react";

interface SupportFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUBJECT_OPTIONS = [
  { value: "account_setup", label: "Neues Konto einrichten" },
  { value: "login_issues", label: "Login-Probleme" },
  { value: "technical", label: "Technische Fragen" },
  { value: "feedback", label: "Feedback zur App" },
  { value: "other", label: "Sonstiges" },
];

export function SupportFormModal({
  isOpen,
  onClose,
}: SupportFormModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("account_setup");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const response = await fetch(`${supabaseUrl}/functions/v1/send-support-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject,
          message: message.trim(),
          honeypot,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setSubmitStatus({
          type: "error",
          message: data.error || "Ein Fehler ist aufgetreten",
        });
        return;
      }

      setSubmitStatus({
        type: "success",
        message: "Ihre Nachricht wurde erfolgreich gesendet!",
      });

      // Clear form after successful submission
      setName("");
      setEmail("");
      setSubject("account_setup");
      setMessage("");

      // Auto-close after 3 seconds on success
      setTimeout(() => {
        onClose();
        setSubmitStatus(null);
      }, 3000);
    } catch {
      setSubmitStatus({
        type: "error",
        message: "Verbindungsfehler. Bitte versuchen Sie es erneut.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setSubmitStatus(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#003366] text-white p-5 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold m-0">Kontakt & Support</h2>
              <p className="text-sm opacity-90 m-0 mt-1">Quartier Spots</p>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-white/80 hover:text-white text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors disabled:opacity-50"
              aria-label="Schliessen"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {submitStatus?.type === "success" ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Nachricht gesendet!
              </h3>
              <p className="text-gray-600">{submitStatus.message}</p>
              <p className="text-sm text-gray-400 mt-4">
                Wird automatisch geschlossen...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {submitStatus?.type === "error" && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">
                  {submitStatus.message}
                </div>
              )}

              {/* Honeypot field - hidden from users */}
              <div className="absolute left-[-9999px]" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input
                  type="text"
                  id="website"
                  name="website"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <div className="mb-4">
                <label className="block mb-1 font-bold text-gray-700 text-sm">
                  Ihr Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="w-full p-3 border border-gray-300 rounded-md text-base text-gray-900 disabled:bg-gray-100"
                  placeholder="Max Mustermann"
                />
              </div>

              <div className="mb-4">
                <label className="block mb-1 font-bold text-gray-700 text-sm">
                  Ihre E-Mail *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="w-full p-3 border border-gray-300 rounded-md text-base text-gray-900 disabled:bg-gray-100"
                  placeholder="max@beispiel.de"
                />
              </div>

              <div className="mb-4">
                <label className="block mb-1 font-bold text-gray-700 text-sm">
                  Betreff *
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="w-full p-3 border border-gray-300 rounded-md text-base text-gray-900 bg-white disabled:bg-gray-100"
                >
                  {SUBJECT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block mb-1 font-bold text-gray-700 text-sm">
                  Ihre Nachricht *
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  disabled={isSubmitting}
                  rows={5}
                  maxLength={5000}
                  className="w-full p-3 border border-gray-300 rounded-md text-base text-gray-900 resize-y disabled:bg-gray-100"
                  placeholder="Beschreiben Sie Ihr Anliegen..."
                />
                <p className="text-xs text-gray-400 mt-1 text-right">
                  {message.length}/5000
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="flex-1 bg-gray-200 text-gray-700 p-3 rounded-md font-bold hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-[#003366] text-white p-3 rounded-md font-bold hover:bg-[#002244] transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Wird gesendet..." : "Absenden"}
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-4 text-center">
                Ihre Daten werden nur zur Bearbeitung Ihrer Anfrage verwendet.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
