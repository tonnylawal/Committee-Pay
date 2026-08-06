'use server'

import { signOut } from '@/lib/auth-supabase'
import { redirect } from 'next/navigation'

export async function logoutAction() {
  await signOut()
  redirect('/sign-in')
}
