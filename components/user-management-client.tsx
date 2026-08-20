'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface User {
  id: string
  email: string
  full_name: string | null
  role: 'admin' | 'manager' | 'viewer'
  is_active: boolean
  created_at: string
}

export default function UserManagementClient() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    role: 'viewer' as const,
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editingEmail, setEditingEmail] = useState<string | null>(null)
  const [emailDraft, setEmailDraft] = useState('')
  const [busyUser, setBusyUser] = useState<string | null>(null)

  const runUserAction = async (userId: string, action: string, label: string) => {
    setError('')
    setSuccess('')
    setBusyUser(userId)
    try {
      const response = await fetch(`/api/dashboard/users/${userId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || `Failed to ${label.toLowerCase()}`)
      setSuccess(data.message || `${label} completed`)
      await fetchUsers()
    } catch (err: any) {
      setError(err.message || `Failed to ${label.toLowerCase()}`)
    } finally {
      setBusyUser(null)
    }
  }

  const updateEmail = async (userId: string) => {
    setError('')
    setSuccess('')
    setBusyUser(userId)
    try {
      const response = await fetch(`/api/dashboard/users/${userId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: emailDraft }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to update email')
      setSuccess('Email updated successfully')
      setEditingEmail(null)
      await fetchUsers()
    } catch (err: any) {
      setError(err.message || 'Failed to update email')
    } finally {
      setBusyUser(null)
    }
  }

  const removeUser = async (user: User) => {
    if (!window.confirm(`Remove ${user.email}? This permanently deletes their account.`)) return
    setBusyUser(user.id)
    try {
      const response = await fetch(`/api/dashboard/users/${user.id}`, { method: 'DELETE' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to remove user')
      setSuccess('User removed successfully')
      await fetchUsers()
    } catch (err: any) {
      setError(err.message || 'Failed to remove user')
    } finally {
      setBusyUser(null)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/dashboard/users')
      if (!response.ok) {
        console.error('Failed to fetch users:', response.status)
        return
      }
      const data = await response.json()
      setUsers(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/dashboard/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create user')
        return
      }

      setSuccess(`User ${formData.email} created successfully!`)
      setFormData({ email: '', full_name: '', role: 'viewer' })
      setShowCreateForm(false)
      await fetchUsers()
    } catch (err: any) {
      setError(err.message || 'Failed to create user')
    }
  }

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/dashboard/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })

      if (!response.ok) {
        setError('Failed to update user role')
        return
      }

      setSuccess('User role updated successfully')
      await fetchUsers()
    } catch (err: any) {
      setError('Failed to update user role')
    }
  }

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/dashboard/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus }),
      })

      if (!response.ok) {
        setError('Failed to update user status')
        return
      }

      setSuccess('User status updated successfully')
      await fetchUsers()
    } catch (err: any) {
      setError('Failed to update user status')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-slate-600">Loading...</p>
      </div>
    )
  }

  return (
    <>
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {success}
        </div>
      )}

      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Team Members</h2>
          <p className="text-sm text-slate-600 mt-1">Manage users, roles, and permissions</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
        >
          {showCreateForm ? 'Hide Form' : '+ Create Admin'}
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="font-semibold text-slate-900 mb-4">Create New User</h3>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="user@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Full Name (Optional)</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'manager' | 'viewer' })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="viewer">Viewer - Read only access</option>
                <option value="manager">Manager - Can create and manage payment links</option>
                <option value="admin">Admin - Full access including user management</option>
              </select>
              <p className="text-xs text-slate-500 mt-2">
                Viewer: Can view all data. Manager: Can create payment links and view transactions. Admin: Full system access.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
              >
                Create User
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

      {/* Users List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {users.length === 0 ? (
          <div className="p-8 text-center text-slate-600">
            <p>No users yet. Create one to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Role</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Created</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {editingEmail === user.id ? (
                        <div className="flex min-w-64 gap-2">
                          <input value={emailDraft} onChange={(e) => setEmailDraft(e.target.value)} type="email" className="w-full rounded border border-slate-300 px-2 py-1" aria-label={`Email for ${user.email}`} />
                          <button type="button" onClick={() => updateEmail(user.id)} disabled={busyUser === user.id} className="text-green-700">Save</button>
                          <button type="button" onClick={() => setEditingEmail(null)} className="text-slate-500">Cancel</button>
                        </div>
                      ) : user.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{user.full_name || '-'}</td>
                    <td className="px-6 py-4 text-sm">
                      <select
                        value={user.role}
                        onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                        className="px-2 py-1 border border-slate-300 rounded text-sm bg-white"
                      >
                        <option value="viewer">Viewer</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                      >
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex min-w-56 flex-wrap gap-x-3 gap-y-2">
                        <button onClick={() => handleToggleActive(user.id, user.is_active)} disabled={user.email.toLowerCase() === 'info@iicar.org'} className="text-blue-600 hover:text-blue-700 font-medium text-sm disabled:cursor-not-allowed disabled:text-slate-300">{user.is_active ? 'Ban' : 'Unban'}</button>
                        <button onClick={() => { setEditingEmail(user.id); setEmailDraft(user.email) }} disabled={user.email.toLowerCase() === 'info@iicar.org'} className="text-slate-700 hover:text-slate-900 font-medium text-sm disabled:cursor-not-allowed disabled:text-slate-300">Edit email</button>
                        <button onClick={() => runUserAction(user.id, 'password_reset', 'Password reset')} disabled={busyUser === user.id} className="text-slate-700 hover:text-slate-900 font-medium text-sm">Reset password</button>
                        <button onClick={() => runUserAction(user.id, 'verification', 'Verification')} disabled={busyUser === user.id} className="text-slate-700 hover:text-slate-900 font-medium text-sm">Send verification</button>
                        <button onClick={() => removeUser(user)} disabled={user.email.toLowerCase() === 'info@iicar.org' || busyUser === user.id} className="text-red-600 hover:text-red-700 font-medium text-sm disabled:cursor-not-allowed disabled:text-slate-300">Remove</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
