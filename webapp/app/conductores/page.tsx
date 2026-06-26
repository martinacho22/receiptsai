'use client';

import { useEffect, useState } from 'react';

interface Driver {
  id: number;
  name: string;
  phone: string;
  email: string;
  tenant_id: number;
}

export default function ConductoresPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '' });

  useEffect(() => {
    fetchDrivers();
  }, []);

  const getToken = () => localStorage.getItem('receiptsai_token');
  const getUser = () => JSON.parse(localStorage.getItem('receiptsai_user') || '{}');

  const fetchDrivers = async () => {
    setLoading(true);
    setError('');
    try {
      const user = getUser();
      const res = await fetch(`/api/drivers?tenant_id=${user.tenant_id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error('Error al cargar conductores');
      const data = await res.json();
      setDrivers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const user = getUser();
      const res = await fetch(`/api/drivers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ ...form, tenant_id: user.tenant_id }),
      });
      if (!res.ok) throw new Error('Error al agregar conductor');
      setShowAdd(false);
      setForm({ name: '', phone: '', email: '' });
      fetchDrivers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este conductor?')) return;
    try {
      const res = await fetch(`/api/drivers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error('Error al eliminar');
      fetchDrivers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500 animate-pulse">Cargando conductores...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Conductores</h2>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium transition-colors"
        >
          + Agregar conductor
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Nuevo conductor</h3>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>
              <button type="submit" className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 font-medium transition-colors">
                Guardar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Drivers table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-6 py-3 font-medium">Nombre</th>
                <th className="text-left px-4 py-3 font-medium">Teléfono</th>
                <th className="text-left px-4 py-3 font-medium">Correo</th>
                <th className="text-center px-6 py-3 font-medium">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {drivers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-gray-400">No hay conductores registrados</td>
                </tr>
              ) : (
                drivers.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium text-gray-800">{d.name}</td>
                    <td className="px-4 py-3 text-gray-600">{d.phone || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{d.email || '—'}</td>
                    <td className="px-6 py-3 text-center">
                      <button
                        onClick={() => handleDelete(d.id)}
                        className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium text-xs transition-colors"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
