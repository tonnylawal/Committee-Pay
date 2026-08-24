'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CreditCard, Key, Webhook, BookOpen, Users, Settings, ShieldCheck, Headset } from 'lucide-react'

const navItems = [
  {
    label: 'Payment Links',
    href: '/dashboard',
    icon: CreditCard,
  },
  {
    label: 'Transactions',
    href: '/dashboard/transactions',
    icon: LayoutDashboard,
  },
  {
    label: 'Users',
    href: '/dashboard/users',
    icon: Users,
  },
  {
    label: 'Audit Logs',
    href: '/dashboard/audit-logs',
    icon: Settings,
  },
  {
    label: 'Security',
    href: '/dashboard/security',
    icon: ShieldCheck,
  },
  {
    label: 'Customer Support',
    href: '/dashboard/support',
    icon: Headset,
  },
  {
    label: 'Training Center',
    href: '/dashboard/training',
    icon: BookOpen,
  },
  {
    label: 'API Keys',
    href: '/dashboard/api-keys',
    icon: Key,
  },
  {
    label: 'Webhook Setup',
    href: '/dashboard/webhook-setup',
    icon: Webhook,
  },
  {
    label: 'Payment Settings',
    href: '/dashboard#payment-settings',
    icon: Settings,
  },
  {
    label: 'API Documentation',
    href: '/api-docs',
    icon: BookOpen,
    external: true,
  },
]

export default function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-slate-900 text-white p-6 min-h-screen sticky top-0 hidden md:block">
      {/* Logo */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Committee</h1>
        <p className="text-xs text-slate-400">Payment Dashboard</p>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const isExternal = item.external

          return (
            <Link
              key={item.href}
              href={item.href}
              target={isExternal ? '_blank' : undefined}
              rel={isExternal ? 'noopener noreferrer' : undefined}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
