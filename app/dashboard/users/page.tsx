import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import UserManagementClient from '@/components/user-management-client'

export default async function UsersPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/sign-in')
  }

  // Check if user is admin
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  // If no user record exists yet, treat as viewer (redirect)
  // If user exists and is not admin, redirect to dashboard
  if (userData && userData.role !== 'admin') {
    redirect('/dashboard')
  }
  
  // If userData is null, user hasn't been created yet, redirect them
  if (!userData) {
    redirect('/dashboard')
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-600 mt-2">Add, manage, and configure user access permissions</p>
        </div>
        <UserManagementClient />
      </div>
    </div>
  )
}
