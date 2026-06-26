interface DashboardKPIProps {
  title: string;
  count: number;
  amount?: number;
  color: 'teal' | 'amber' | 'green' | 'red';
  icon: string;
}

const colorClasses = {
  teal: {
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    text: 'text-teal-700',
    count: 'text-teal-600',
  },
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    count: 'text-amber-600',
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
    count: 'text-green-600',
  },
  red: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    count: 'text-red-600',
  },
};

export default function DashboardKPI({ title, count, amount, color, icon }: DashboardKPIProps) {
  const c = colorClasses[color];

  return (
    <div className={`${c.bg} ${c.border} border rounded-xl p-6 shadow-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`${c.text} text-sm font-medium`}>{title}</p>
          <p className={`${c.count} text-3xl font-bold mt-1`}>{count}</p>
          {amount !== undefined && (
            <p className={`${c.text} text-sm mt-1`}>
              ${amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </p>
          )}
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}
