'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/auth-client'

interface AuthFormProps {
  mode: 'sign-in' | 'sign-up'
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()
      console.log('[v0] Supabase client created')

      if (mode === 'sign-in') {
        console.log('[v0] Attempting sign-in with email:', email)
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        console.log('[v0] Sign in response:', { 
          hasData: !!data, 
          hasSession: !!data?.session,
          error: signInError?.message 
        })

        if (signInError) {
          console.log('[v0] Sign in error:', signInError.message)
          setError(signInError.message || 'Sign in failed')
          setLoading(false)
          return
        }

        if (!data?.session) {
          console.log('[v0] No session returned')
          setError('Sign in failed - no session created')
          setLoading(false)
          return
        }

        console.log('[v0] Session created, waiting for cookies to be set...')
        // Wait for cookies to be set before redirecting
        await new Promise(resolve => setTimeout(resolve, 800))
        console.log('[v0] Redirecting to dashboard')
        router.push('/dashboard')
        router.refresh()
      } else {
        console.log('[v0] Attempting sign-up with email:', email)
        const { error: signUpError, data: signUpData } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: email.split('@')[0],
            },
          },
        })

        console.log('[v0] Sign up response:', { 
          hasData: !!signUpData,
          error: signUpError?.message 
        })

        if (signUpError) {
          console.log('[v0] Sign up error:', signUpError.message)
          setError(signUpError.message || 'Sign up failed')
          setLoading(false)
          return
        }

        console.log('[v0] Sign up successful, redirecting to dashboard')
        await new Promise(resolve => setTimeout(resolve, 800))
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err: any) {
      console.log('[v0] Catch error:', err.message)
      setError(err.message || 'An error occurred')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="••••••••"
        />
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold py-2 px-4 rounded-lg transition"
      >
        {loading ? 'Loading...' : mode === 'sign-in' ? 'Sign In' : 'Sign Up'}
      </button>
    </form>
  )
}
