"use client";

import { useState } from "react";
import { useFlohmarkt } from "../../FlohmarktContext";

export function EventCreateForm() {
  const { createEvent } = useFlohmarkt();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createEvent(title, date, startTime, endTime);
  };

  return (
    <div className="max-w-[600px] mx-auto bg-white p-5 rounded-lg shadow-md">
      <h2 className="mt-0 text-[#003366]">Neues Event anlegen</h2>
      <p className="text-gray-600">
        Trage hier die Eckdaten für deine Veranstaltung ein.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-1 font-bold text-gray-700 text-sm">
            Titel der Veranstaltung
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="z.B. Hof-Flohmarkt im Neuen Quartier"
            required
            className="w-full p-3 border border-gray-300 rounded-md text-base text-gray-900"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-bold text-gray-700 text-sm">
            Datum
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-md text-base text-gray-900"
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1 mb-4">
            <label className="block mb-1 font-bold text-gray-700 text-sm">
              Beginn
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-md text-base text-gray-900"
            />
          </div>
          <div className="flex-1 mb-4">
            <label className="block mb-1 font-bold text-gray-700 text-sm">
              Ende
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-md text-base text-gray-900"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-[#003366] text-white p-3.5 border-none rounded-md text-lg font-bold mt-2 cursor-pointer hover:bg-[#002244]"
        >
          Event erstellen
        </button>
      </form>
    </div>
  );
}
