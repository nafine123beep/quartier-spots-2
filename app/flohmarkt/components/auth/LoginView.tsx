"use client";

import { useState } from "react";
import { useFlohmarkt } from "../../FlohmarktContext";

export function LoginView() {
  const { setCurrentView, login } = useFlohmarkt();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulated auth - in production, integrate with Supabase
    alert("Login erfolgreich! (Veranstalter-Modus)");
    login();
  };

  const handleGoogleLogin = () => {
    alert("Login erfolgreich! (Veranstalter-Modus)");
    login();
  };

  return (
    <div className="fixed inset-0 bg-gray-100 z-[4000] flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="p-5 flex items-center">
        <button
          onClick={() => setCurrentView("frontpage")}
          className="bg-transparent border-none text-2xl text-[#003366] p-0 mr-4 cursor-pointer"
        >
          ←
        </button>
        <span>Startseite</span>
      </div>

      {/* Form Container */}
      <div className="max-w-[400px] w-full mx-auto p-5">
        <h2 className="mt-0 text-[#003366]">Login für Veranstalter:innen</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1 font-bold text-gray-600 text-sm">
              E-Mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-md text-base"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-bold text-gray-600 text-sm">
              Passwort
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-md text-base"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#003366] text-white p-3.5 border-none rounded-md text-lg font-bold mt-2 cursor-pointer hover:bg-[#002244]"
          >
            Einloggen
          </button>
        </form>

        <button
          onClick={handleGoogleLogin}
          className="w-full bg-white border border-gray-300 text-gray-700 flex items-center justify-center gap-2.5 p-3 rounded-md font-bold mt-5 shadow-sm cursor-pointer hover:bg-gray-50"
        >
          <span className="font-bold font-serif text-[#DB4437] text-xl">G</span>
          Weiter mit Google
        </button>

        <div className="mt-5 text-center text-sm">
          Noch kein Account?{" "}
          <a
            onClick={() => setCurrentView("register")}
            className="text-[#003366] no-underline cursor-pointer hover:underline"
          >
            Jetzt registrieren
          </a>
        </div>
      </div>
    </div>
  );
}
