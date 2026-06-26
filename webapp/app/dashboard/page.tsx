'use client';

import { useEffect, useState } from 'react';
import DashboardKPI from '@/components/DashboardKPI';

interface ReceiptSummary {
  total: number;
  pending: number;
  approved: number;
  paid: number;
  rejected: number;
  total_amount: number;
  pending_amount: number;
  approved_amount: number;
  paid_amount: number;
  rejected_amount: number;
}

interface DriverSummary {
  driver_id: number;
  driver_name: string;
  total: number;
  pending: number;
  approved: number;
  paid: number;
  total_amount: number;
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<ReceiptSummary | null>(null);
  const [drivers, setDrivers] = useState<DriverSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('receiptsai_token');
      const user = JSON.parse(localStorage.getItem('receiptsai_user') || '{}');

      const res = await fetch(`/api/receipts/summary?tenant_id=${user.tenant_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Error al cargar datos');

      const data = await res.json();
      setSummary(data);

      // Build per-driver breakdown
      const receiptsRes = await fetch(`/api/receipts?limit=200&tenant_id=${user.tenant_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (receiptsRes.ok) {
        const receipts = await receiptsRes.json();
        const driverMap = new Map<number, DriverSummary>();

        for (const r of receipts) {
          if (!r.driver_id) continue;
          const d = driverMap.get(r.driver_id) || {
            driver_id: r.driver_id,
            driver_name: r.driver_name || 'Sin asignar',
            total: 0, pending: 0, approved: 0, paid: 0, total_amount: 0,
          };
          d.total++;
          d.total_amount += parseFloat(r.amount || '0');
          if (r.status === 'pending') d.pending++;
          else if (r.status === 'approved') d.approved++;
          else if (r.status === 'paid') d.paid++;
          driverMap.set(r.driver_id, d);
        }

        setDrivers(Array.from(driverMap.values()));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500 animate-pulse">Cargando dashboard...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={fetchData} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
          Reintentar
        </button>
      </div>
    );
  }

  if (!summary) {
    return <div className="text-center py-12 text-gray-500">No hay datos disponibles</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardKPI
          title="Pendientes"
          count={summary.pending}
          amount={summary.pending_amount}
          color="amber"
          icon="⏳"
        />
        <DashboardKPI
          title="Aprobados"
          count={summary.approved}
          amount={summary.approved_amount}
          color="teal"
          icon="✅"
        />
        <DashboardKPI
          title="Pagados"
          count={summary.paid}
          amount={summary.paid_amount}
          color="green"
          icon="💰"
        />
        <DashboardKPI
          title="Total"
          count={summary.total}
          amount={summary.total_amount}
          color="teal"
          icon="📊"
        />
      </div>

      {/* Per-driver breakdown */}
      {drivers.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">Por conductor</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-6 py-3 font-medium">Conductor</th>
                  <th className="text-center px-4 py-3 font-medium">Total</th>
                  <th className="text-center px-4 py-3 font-medium">Pendientes</th>
                  <th className="text-center px-4 py-3 font-medium">Aprobados</th>
                  <th className="text-center px-4 py-3 font-medium">Pagados</th>
                  <th className="text-right px-6 py-3 font-medium">Monto total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {drivers.map((d) => (
                  <tr key={d.driver_id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium text-gray-800">{d.driver_name}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{d.total}</td>
                    <td className="px-4 py-3 text-center text-amber-600">{d.pending}</td>
                    <td className="px-4 py-3 text-center text-teal-600">{d.approved}</td>
                    <td className="px-4 py-3 text-center text-green-600">{d.paid}</td>
                    <td className="px-6 py-3 text-right font-medium text-gray-700">
                      ${d.total_amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
