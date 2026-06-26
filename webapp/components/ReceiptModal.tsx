'use client';

import { useState } from 'react';

interface Receipt {
  id: number;
  driver_id?: number;
  driver_name?: string;
  amount: string;
  description: string;
  image_url?: string;
  status: string;
  created_at: string;
  receipt_type?: string;
}

interface ReceiptModalProps {
  receipt: Receipt;
  onClose: () => void;
  onStatusChange: (id: number, status: string, notes?: string) => void;
}

const STATUS_ACTIONS: { label: string; status: string; color: string }[] = [
  { label: 'Aprobar', status: 'approved', color: 'bg-teal-600 hover:bg-teal-700' },
  { label: 'Rechazar', status: 'rejected', color: 'bg-red-600 hover:bg-red-700' },
  { label: 'Pagar', status: 'paid', color: 'bg-green-600 hover:bg-green-700' },
];

export default function ReceiptModal({ receipt, onClose, onStatusChange }: ReceiptModalProps) {
  const [notes, setNotes] = useState('');
  const [imgError, setImgError] = useState(false);

  const statusLabels: Record<string, string> = {
    pending: 'Pendiente',
    approved: 'Aprobado',
    paid: 'Pagado',
    rejected: 'Rechazado',
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-teal-100 text-teal-700',
    paid: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">
            Comprobante #{receipt.id}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>

        <div className="p-6 space-y-4">
          {/* Image */}
          {receipt.image_url && !imgError ? (
            <div className="bg-gray-100 rounded-xl overflow-hidden">
              <img
                src={receipt.image_url}
                alt="Comprobante"
                className="w-full object-contain max-h-80"
                onError={() => setImgError(true)}
              />
            </div>
          ) : (
            <div className="bg-gray-100 rounded-xl h-48 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <span className="text-4xl">📄</span>
                <p className="mt-2 text-sm">Sin imagen disponible</p>
              </div>
            </div>
          )}

          {/* Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Monto</p>
              <p className="font-semibold text-gray-800">
                ${parseFloat(receipt.amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Estado</p>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusColors[receipt.status] || 'bg-gray-100 text-gray-700'}`}>
                {statusLabels[receipt.status] || receipt.status}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Conductor</p>
              <p className="font-medium text-gray-800">{receipt.driver_name || 'Sin asignar'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Fecha</p>
              <p className="font-medium text-gray-800">
                {new Date(receipt.created_at).toLocaleDateString('es-MX')}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500">Descripción</p>
            <p className="text-gray-800">{receipt.description || 'Sin descripción'}</p>
          </div>

          {/* Status actions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notas</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none resize-none"
              rows={2}
              placeholder="Notas opcionales..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            {STATUS_ACTIONS.map((action) => (
              <button
                key={action.status}
                onClick={() => onStatusChange(receipt.id, action.status, notes)}
                className={`flex-1 ${action.color} text-white py-2 rounded-lg font-medium transition-colors`}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
