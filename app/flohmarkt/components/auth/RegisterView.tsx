"use client";

import { useState } from "react";
import { useFlohmarkt } from "../../FlohmarktContext";

export function RegisterView() {
  const { setCurrentView, login } = useFlohmarkt();
  const [name, setName] = useState("");
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
        <h2 className="mt-0 text-[#003366]">Als Veranstalter:in registrieren</h2>
        <p className="text-gray-600 mb-5">
          Erstelle einen Account, um ein Event anzulegen.
        </p>

        <button
          onClick={handleGoogleLogin}
          className="w-full bg-white border border-gray-300 text-gray-700 flex items-center justify-center gap-2.5 p-3 rounded-md font-bold mb-5 shadow-sm cursor-pointer hover:bg-gray-50"
        >
          <span className="font-bold font-serif text-[#DB4437] text-xl">G</span>
          Weiter mit Google
        </button>

        {/* Divider */}
        <div className="text-center my-5 text-gray-500 text-sm relative">
          <span className="bg-gray-100 px-2 relative z-10">ODER</span>
          <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-300 -z-0" />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1 font-bold text-gray-600 text-sm">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Max Mustermann"
              className="w-full p-3 border border-gray-300 rounded-md text-base"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-bold text-gray-600 text-sm">
              E-Mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="max@beispiel.de"
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
            Account erstellen
          </button>
        </form>

        <div className="mt-5 text-center text-sm">
          Bereits registriert?{" "}
          <a
            onClick={() => setCurrentView("login")}
            className="text-[#003366] no-underline cursor-pointer hover:underline"
          >
            Hier einloggen
          </a>
        </div>
      </div>
    </div>
  );
}
