"use client";

import { useEffect, useState } from "react";

interface Summary {
  total_pending: number;
  total_approved: number;
  total_paid: number;
  pending_amount: number;
  approved_amount: number;
  paid_amount: number;
}

const defaultSummary: Summary = {
  total_pending: 0,
  total_approved: 0,
  total_paid: 0,
  pending_amount: 0,
  approved_amount: 0,
  paid_amount: 0,
};

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary>(defaultSummary);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSummary() {
      const tenantId = localStorage.getItem("tenant_id");
      const token = localStorage.getItem("token");

      if (!tenantId || !token) return;

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/receipts/summary?tenant_id=${tenantId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.ok) {
          const data = await res.json();
          setSummary(data);
        }
      } catch (err) {
        console.error("Failed to fetch summary", err);
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
  }, []);

  const cards = [
    {
      title: "Pendientes",
      count: summary.total_pending,
      amount: summary.pending_amount,
      color: "bg-yellow-50 border-yellow-200 text-yellow-800",
    },
    {
      title: "Aprobados",
      count: summary.total_approved,
      amount: summary.approved_amount,
      color: "bg-green-50 border-green-200 text-green-800",
    },
    {
      title: "Pagados",
      count: summary.total_paid,
      amount: summary.paid_amount,
      color: "bg-blue-50 border-blue-200 text-blue-800",
    },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Resumen</h1>

      {loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.title}
              className={`rounded-xl border-2 p-6 ${card.color}`}
            >
              <h3 className="text-lg font-semibold">{card.title}</h3>
              <p className="mt-2 text-3xl font-bold">{card.count}</p>
              <p className="mt-1 text-sm opacity-75">
                Total: ${card.amount.toLocaleString("es-MX", {
                  minimumFractionDigits: 2,
                })}{" "}
                MXN
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 rounded-xl border bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          ¿Cómo funciona?
        </h2>
        <ol className="mt-4 space-y-3 text-sm text-gray-600">
          <li>
            <strong>1.</strong> Registra a tus choferes en la sección{" "}
            <em>Choferes</em>.
          </li>
          <li>
            <strong>2.</strong> Tus choferes envían fotos de sus recibos al
            número de WhatsApp de ReceiptsAI.
          </li>
          <li>
            <strong>3.</strong> Los recibos aparecen aquí automáticamente.
            Aprueba o rechaza desde la sección <em>Recibos</em>.
          </li>
          <li>
            <strong>4.</strong> Exporta reportes para tu contador desde{" "}
            <em>Reportes</em>.
          </li>
        </ol>
      </div>
    </div>
  );
}
