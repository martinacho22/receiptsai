'use client';

import { useEffect, useState } from 'react';

export default function ConfiguracionPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const raw = localStorage.getItem('receiptsai_user');
    if (raw) setUser(JSON.parse(raw));
  }, []);

  const pricingPlans = [
    {
      name: 'Básico',
      price: '$499',
      period: '/mes',
      features: ['Hasta 5 conductores', '100 comprobantes/mes', 'Soporte por correo'],
      color: 'border-gray-200',
      header: 'bg-gray-50',
      btn: 'bg-gray-600 hover:bg-gray-700',
    },
    {
      name: 'Profesional',
      price: '$999',
      period: '/mes',
      features: ['Hasta 20 conductores', '500 comprobantes/mes', 'Soporte prioritario', 'API acceso completo'],
      color: 'border-teal-200',
      header: 'bg-teal-50',
      btn: 'bg-teal-600 hover:bg-teal-700',
      popular: true,
    },
    {
      name: 'Empresarial',
      price: '$1,999',
      period: '/mes',
      features: ['Conductores ilimitados', 'Comprobantes ilimitados', 'Soporte 24/7', 'API acceso completo', 'Reportes personalizados'],
      color: 'border-amber-200',
      header: 'bg-amber-50',
      btn: 'bg-amber-600 hover:bg-amber-700',
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Configuración</h2>

      {/* Company info */}
      {user && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Información de la empresa</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Empresa</p>
              <p className="font-medium text-gray-800">{user.company_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Rol</p>
              <p className="font-medium text-gray-800">{user.role}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">ID de tenant</p>
              <p className="font-mono text-sm text-gray-600">{user.tenant_id}</p>
            </div>
          </div>
        </div>
      )}

      {/* Usage */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Uso</h3>
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
          <p className="text-sm text-teal-700">
            Consulta tu uso actual desde el panel de Dashboard o contacta a soporte para más detalles.
          </p>
        </div>
      </div>

      {/* Pricing */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Planes de precios</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-xl border-2 ${plan.color} shadow-sm overflow-hidden relative`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-teal-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  POPULAR
                </div>
              )}
              <div className={`${plan.header} px-6 py-4 border-b border-gray-100`}>
                <h4 className="text-xl font-bold text-gray-800">{plan.name}</h4>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500 text-sm">{plan.period}</span>
                </div>
              </div>
              <div className="p-6 space-y-3">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-teal-500">✓</span>
                    {f}
                  </div>
                ))}
                <button className={`w-full ${plan.btn} text-white py-2 rounded-lg font-medium transition-colors mt-4`}>
                  Contratar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
