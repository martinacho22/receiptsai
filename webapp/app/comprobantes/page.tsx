'use client';

import { useEffect, useState } from 'react';
import ReceiptModal from '@/components/ReceiptModal';

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

export default function ComprobantesPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchReceipts();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('receiptsai_token');
    const user = JSON.parse(localStorage.getItem('receiptsai_user') || '{}');
    return {
      'Authorization': `Bearer ${token}`,
      'tenant_id': user.tenant_id,
    };
  };

  const fetchReceipts = async () => {
    setLoading(true);
    setError('');
    try {
      const user = JSON.parse(localStorage.getItem('receiptsai_user') || '{}');
      const res = await fetch(`/api/receipts?limit=200&tenant_id=${user.tenant_id}`, {
        headers: { Authorization: `Bearer ${getAuthHeaders().Authorization}` },
      });

      if (!res.ok) throw new Error('Error al cargar comprobantes');

      const data = await res.json();
      setReceipts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: number, status: string, notes?: string) => {
    try {
      const user = JSON.parse(localStorage.getItem('receiptsai_user') || '{}');
      const token = localStorage.getItem('receiptsai_token');

      const res = await fetch(`/api/receipts/${id}/status?admin_id=${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status, notes: notes || '' }),
      });

      if (!res.ok) throw new Error('Error al actualizar estado');

      setSelectedReceipt(null);
      fetchReceipts();
    } catch (err: any) {
      setError(err.message);
    }
  };

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

  const filtered = receipts.filter((r) => {
    const matchSearch = !search || 
      r.driver_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) {
    return <div className="text-center py-12 text-gray-500 animate-pulse">Cargando comprobantes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Comprobantes</h2>
        <span className="text-sm text-gray-500">{receipts.length} registros</span>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por conductor o descripción..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
        >
          <option value="all">Todos</option>
          <option value="pending">Pendientes</option>
          <option value="approved">Aprobados</option>
          <option value="paid">Pagados</option>
          <option value="rejected">Rechazados</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
          <button onClick={fetchReceipts} className="ml-4 underline">Reintentar</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-6 py-3 font-medium">ID</th>
                <th className="text-left px-4 py-3 font-medium">Conductor</th>
                <th className="text-left px-4 py-3 font-medium">Descripción</th>
                <th className="text-right px-4 py-3 font-medium">Monto</th>
                <th className="text-center px-4 py-3 font-medium">Estado</th>
                <th className="text-center px-4 py-3 font-medium">Foto</th>
                <th className="text-center px-6 py-3 font-medium">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    No hay comprobantes
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-gray-600 font-mono">#{r.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{r.driver_name || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{r.description || '—'}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-700">
                      ${parseFloat(r.amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusColors[r.status] || 'bg-gray-100 text-gray-700'}`}>
                        {statusLabels[r.status] || r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {r.image_url ? (
                        <span className="text-green-500" title="Con foto">📷</span>
                      ) : (
                        <span className="text-gray-300" title="Sin foto">—</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <button
                        onClick={() => setSelectedReceipt(r)}
                        className="px-3 py-1.5 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 font-medium text-xs transition-colors"
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {selectedReceipt && (
        <ReceiptModal
          receipt={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
