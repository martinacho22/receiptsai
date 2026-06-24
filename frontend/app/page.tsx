"use client";

import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="flex items-center justify-between px-6 py-4">
        <h1 className="text-2xl font-bold text-primary-700">ReceiptsAI</h1>
        <Link
          href="/login"
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          Iniciar Sesion
        </Link>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-20 text-center">
        <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Tus recibos de gasolina, organizados al instante
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
          Tus choferes envian la foto del recibo por WhatsApp. ReceiptsAI
          extrae el monto automaticamente y lo muestra en un tablero para
          que sepas exactamente cuanto le debes a cada quien.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-2xl">
              📸
            </div>
            <h3 className="mt-4 font-semibold">1. Chófer envía foto</h3>
            <p className="mt-2 text-sm text-gray-500">
              Toman foto del recibo y la mandan por WhatsApp — igual que siempre.
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-2xl">
              🤖
            </div>
            <h3 className="mt-4 font-semibold">2. IA lee el recibo</h3>
            <p className="mt-2 text-sm text-gray-500">
              ReceiptsAI extrae monto, fecha, gasolinera y categoría automáticamente.
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-2xl">
              📊
            </div>
            <h3 className="mt-4 font-semibold">3. Admin revisa todo</h3>
            <p className="mt-2 text-sm text-gray-500">
              Tablero con todos los gastos, totales por chofer, y reportes exportables.
            </p>
          </div>
        </div>

        <div className="mt-12">
          <Link
            href="/login"
            className="inline-block rounded-lg bg-primary-600 px-8 py-3 text-lg font-medium text-white shadow-lg hover:bg-primary-700"
          >
            Comenzar ahora
          </Link>
        </div>
      </main>
    </div>
  );
}
