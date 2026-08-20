'use client'

import * as React from 'react'
import { ResponsiveContainer, Tooltip } from 'recharts'

export function ChartContainer({ config, className, children }: { config: Record<string, { label?: string; color: string }>; className?: string; children: React.ReactNode }) {
  return <div data-chart className={className} style={Object.fromEntries(Object.entries(config).map(([key, value]) => [`--color-${key}`, value.color])) as React.CSSProperties}><ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer></div>
}

export function ChartTooltip({ content }: { content: React.ReactElement }) {
  return <Tooltip content={content} />
}

export function ChartTooltipContent({}: { indicator?: string }) {
  return <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg" />
}
