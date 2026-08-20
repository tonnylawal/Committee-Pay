'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getPlatformSettings, updatePlatformSettings } from '@/app/actions/platform-settings'

type Settings = Awaited<ReturnType<typeof getPlatformSettings>>

const colorFields = [
  ['theme_primary_color', 'Primary color'],
  ['theme_background_color', 'Background color'],
  ['theme_text_color', 'Text color'],
  ['theme_accent_color', 'Accent color'],
] as const

export default function PlatformSettingsForm({ initialSettings }: { initialSettings: Settings }) {
  const [settings, setSettings] = useState(initialSettings)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const setValue = (key: keyof Settings, value: string) => setSettings((current) => ({ ...current, [key]: value }))

  async function save() {
    setSaving(true)
    setMessage('')
    try {
      await updatePlatformSettings({
        disabled_payment_message: settings.disabled_payment_message || '',
        support_email: settings.support_email || '',
        theme_primary_color: settings.theme_primary_color || '',
        theme_background_color: settings.theme_background_color || '',
        theme_text_color: settings.theme_text_color || '',
        theme_accent_color: settings.theme_accent_color || '',
      })
      setMessage('Settings saved.')
      router.refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not save settings.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-900">Payment page settings</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">Set the global outage message and default colors. Individual links can override these colors.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <label className="lg:col-span-2">
          <span className="mb-2 block text-sm font-medium text-slate-700">Disabled-link message</span>
          <textarea value={settings.disabled_payment_message || ''} onChange={(event) => setValue('disabled_payment_message', event.target.value)} rows={3} maxLength={500} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-medium text-slate-700">Support email</span>
          <input type="email" value={settings.support_email || ''} onChange={(event) => setValue('support_email', event.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          {colorFields.map(([key, label]) => (
            <label key={key}>
              <span className="mb-2 block text-xs font-medium text-slate-700">{label}</span>
              <div className="flex items-center gap-2">
                <input type="color" value={settings[key] || '#000000'} onChange={(event) => setValue(key, event.target.value)} className="size-9 cursor-pointer rounded border border-slate-300 bg-white p-1" aria-label={label} />
                <input value={settings[key] || ''} onChange={(event) => setValue(key, event.target.value)} className="min-w-0 flex-1 rounded-md border border-slate-300 px-2 py-2 text-xs font-mono text-slate-900" aria-label={`${label} hex value`} />
              </div>
            </label>
          ))}
        </div>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button type="button" onClick={save} disabled={saving} className="rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-800 disabled:opacity-50">{saving ? 'Saving...' : 'Save settings'}</button>
        {message && <p className="text-sm text-slate-600" role="status">{message}</p>}
      </div>
    </section>
  )
}
