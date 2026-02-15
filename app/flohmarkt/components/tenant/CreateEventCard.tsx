'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { CreateEventModal } from './CreateEventModal';

export function CreateEventCard() {
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowCreateForm(true)}
        className="bg-white border-2 border-dashed border-[#003366] rounded-lg p-8 hover:bg-gray-50 hover:border-[#002244] transition-all cursor-pointer flex flex-col items-center justify-center min-h-[300px] group focus:ring-2 focus:ring-[#003366] focus:ring-offset-2"
        aria-label="Neues Event erstellen"
      >
        <div className="w-16 h-16 rounded-full bg-[#003366] flex items-center justify-center mb-4 group-hover:bg-[#002244] transition-colors">
          <Plus className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-[#003366] m-0">Neues Event</h3>
        <p className="text-gray-600 text-sm mt-2 text-center">
          Erstelle ein neues Event für deine Organisation
        </p>
      </button>

      {showCreateForm && (
        <CreateEventModal onClose={() => setShowCreateForm(false)} />
      )}
    </>
  );
}
