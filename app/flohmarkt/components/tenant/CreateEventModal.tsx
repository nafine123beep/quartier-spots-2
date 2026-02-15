'use client';

import { X } from 'lucide-react';
import { CreateEventForm } from './CreateEventForm';

interface CreateEventModalProps {
  onClose: () => void;
}

export function CreateEventModal({ onClose }: CreateEventModalProps) {
  const handleSuccess = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-[#003366] text-white p-5 rounded-t-xl flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-xl font-bold m-0">Neues Event erstellen</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#003366] rounded"
            aria-label="Schließen"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <CreateEventForm onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  );
}
