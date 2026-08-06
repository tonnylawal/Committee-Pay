interface StatsOverviewProps {
  stats: {
    total: number
    completed: number
    pending: number
    failed: number
    totalAmountUsd: number
    totalAmountKes: number
  }
}

export default function StatsOverview({ stats }: StatsOverviewProps) {
  const statCards = [
    {
      label: 'Total Payments',
      value: stats.total,
      color: 'bg-blue-50 border-blue-200',
      textColor: 'text-blue-900',
    },
    {
      label: 'Completed',
      value: stats.completed,
      color: 'bg-green-50 border-green-200',
      textColor: 'text-green-900',
    },
    {
      label: 'Pending',
      value: stats.pending,
      color: 'bg-yellow-50 border-yellow-200',
      textColor: 'text-yellow-900',
    },
    {
      label: 'Failed',
      value: stats.failed,
      color: 'bg-red-50 border-red-200',
      textColor: 'text-red-900',
    },
    {
      label: 'Total (USD)',
      value: `$${stats.totalAmountUsd.toFixed(2)}`,
      color: 'bg-purple-50 border-purple-200',
      textColor: 'text-purple-900',
    },
    {
      label: 'Total (KES)',
      value: `KES ${stats.totalAmountKes.toFixed(0)}`,
      color: 'bg-indigo-50 border-indigo-200',
      textColor: 'text-indigo-900',
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
      {statCards.map((card, index) => (
        <div key={index} className={`${card.color} border rounded-lg p-3 sm:p-4 md:p-6`}>
          <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1 sm:mb-2 truncate">{card.label}</p>
          <p className={`text-lg sm:text-2xl md:text-3xl font-bold ${card.textColor} truncate`}>{card.value}</p>
        </div>
      ))}
    </div>
  )
}
