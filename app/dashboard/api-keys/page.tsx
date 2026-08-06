'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

interface ApiKey {
  id: string
  name: string
  key_preview: string
  product_slug: string | null
  permissions: string[]
  rate_limit_per_hour: number
  last_used_at: string | null
  expires_at: string | null
  is_active: boolean
  created_at: string
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    product_slug: '',
    rate_limit_per_hour: 1000,
  })
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [newKeyDisplay, setNewKeyDisplay] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const user = await getUser()
      if (!user) {
        redirect('/sign-in')
      }
      fetchApiKeys()
    }
    checkAuth()
  }, [])

  const fetchApiKeys = async () => {
    try {
      const response = await fetch('/api/dashboard/api-keys')
      const data = await response.json()
      setApiKeys(data)
    } catch (error) {
      console.error('Error fetching API keys:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/dashboard/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      if (data.full_key) {
        setNewKeyDisplay(data.full_key)
      }
      setFormData({ name: '', product_slug: '', rate_limit_per_hour: 1000 })
      setShowCreateForm(false)
      await fetchApiKeys()
    } catch (error) {
      console.error('Error creating API key:', error)
    }
  }

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-slate-600">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto p-8">
        <div className="mb-8">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">API Keys</h1>
              <p className="text-slate-600 mt-2">Manage your API keys for programmatic access</p>
            </div>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
            >
              Create API Key
            </button>
          </div>
        </div>

        {/* New Key Display */}
        {newKeyDisplay && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-green-900 mb-2">Your API Key</h3>
            <p className="text-sm text-green-800 mb-4">Save this key somewhere safe. You won&apos;t be able to see it again.</p>
            <div className="bg-white border border-green-200 rounded p-3 flex items-center justify-between font-mono text-sm">
              <code className="text-slate-900">{newKeyDisplay}</code>
              <button
                onClick={() => {
                  handleCopyKey(newKeyDisplay)
                  setNewKeyDisplay(null)
                }}
                className="ml-4 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs"
              >
                Copy & Close
              </button>
            </div>
          </div>
        )}

        {/* Create Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="font-semibold text-slate-900 mb-4">Create New API Key</h3>
            <form onSubmit={handleCreateKey} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Key Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Mobile App, Dashboard"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Product Slug (Optional)</label>
                <input
                  type="text"
                  value={formData.product_slug}
                  onChange={(e) => setFormData({ ...formData, product_slug: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., mobile-app"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Rate Limit (requests per hour)</label>
                <input
                  type="number"
                  value={formData.rate_limit_per_hour}
                  onChange={(e) => setFormData({ ...formData, rate_limit_per_hour: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="10"
                  max="10000"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
                >
                  Create Key
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-900 font-semibold py-2 px-6 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* API Keys List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {apiKeys.length === 0 ? (
            <div className="p-8 text-center text-slate-600">
              <p className="mb-4">No API keys yet. Create one to get started.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Key</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Product</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Last Used</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {apiKeys.map((key) => (
                  <tr key={key.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{key.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <code className="bg-slate-100 px-2 py-1 rounded">{key.key_preview}</code>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{key.product_slug || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${key.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                      >
                        {key.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => handleCopyKey(key.key_preview)}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {copiedKey === key.key_preview ? 'Copied!' : 'Copy Preview'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* API Documentation Link */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">API Documentation</h3>
          <p className="text-sm text-blue-800 mb-4">Learn how to use your API key to integrate payment processing into your products.</p>
          <Link href="/api-docs" className="text-blue-600 hover:text-blue-700 font-semibold">
            View API Documentation →
          </Link>
        </div>
      </div>
    </div>
  )
}
