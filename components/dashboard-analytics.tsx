'use client'

import { useMemo, useState, useTransition } from 'react'
import { getDashboardAnalytics } from '@/app/actions/analytics'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import type { DashboardAnalytics } from '@/app/actions/analytics'

const ranges = [7, 14, 30, 90, 180, 365]

export default function DashboardAnalytics({ initialData }: { initialData: DashboardAnalytics }) {
  const [rangeDays, setRangeDays] = useState(initialData.rangeDays)
  const [data, setData] = useState(initialData)
  const [isPending, startTransition] = useTransition()

  const changeRange = (value: number) => {
    setRangeDays(value)
    startTransition(async () => setData(await getDashboardAnalytics(value)))
  }
  const chartData = useMemo(() => data.trend.map((row) => ({ ...row, label: row.date.slice(5) })), [data.trend])
  const statusData = data.status.length ? data.status : [{ status: 'No payments', count: 0 }]

  return (
    <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:mt-8 sm:p-6" aria-labelledby="analytics-heading">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="analytics-heading" className="text-lg font-semibold text-slate-900">Payment analytics</h2>
          <p className="text-sm text-slate-500">Revenue and payment activity for the selected period.</p>
        </div>
        <select value={rangeDays} onChange={(event) => changeRange(Number(event.target.value))} disabled={isPending} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 disabled:opacity-60" aria-label="Analytics date range">
          {ranges.map((days) => <option key={days} value={days}>Last {days} days</option>)}
        </select>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div>
          <h3 className="mb-3 text-sm font-medium text-slate-700">Completed revenue (KES)</h3>
          <ChartContainer config={{ revenueKes: { label: 'Revenue', color: 'var(--chart-1)' } }} className="h-64 w-full">
            <AreaChart data={chartData} accessibilityLayer>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} width={56} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area dataKey="revenueKes" type="monotone" fill="var(--color-revenueKes)" fillOpacity={0.2} stroke="var(--color-revenueKes)" strokeWidth={2} />
            </AreaChart>
          </ChartContainer>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-medium text-slate-700">Payment status</h3>
          <ChartContainer config={{ count: { label: 'Payments', color: 'var(--chart-2)' } }} className="h-64 w-full">
            <BarChart data={statusData} accessibilityLayer>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="status" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={32} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--color-count)" radius={4} />
            </BarChart>
          </ChartContainer>
        </div>
      </div>
      <p className="sr-only">Selected range: {rangeDays} days. The range selector is ready for server-connected updates.</p>
    </section>
  )
}
