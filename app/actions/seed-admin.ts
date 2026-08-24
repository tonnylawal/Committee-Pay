'use server'

import { createClient as createServiceRoleClient } from '@supabase/supabase-js'

export async function resetAndCreateAdminUser() {
  const email = 'brainbooster254@gmail.com'
  const password = '@Wandago182!'
  try {
    const supabase = createServiceRoleClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const { data: users, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1000 })
    if (listError) throw listError
    const existing = users.users.find((user) => user.email?.toLowerCase() === email)
    let userId = existing?.id
    if (existing) {
      const { error } = await supabase.auth.admin.updateUserById(existing.id, { password, email_confirm: true, user_metadata: { ...existing.user_metadata, name: 'Committee Administrator' } })
      if (error) throw error
    } else {
      const { data, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { name: 'Committee Administrator' } })
      if (error || !data.user) throw error || new Error('Admin account was not created')
      userId = data.user.id
    }
    if (!userId) throw new Error('Admin account has no user id')
    const { error: profileError } = await supabase.from('users').upsert({ id: userId, email, full_name: 'Committee Administrator', role: 'admin', updated_at: new Date().toISOString() }, { onConflict: 'id' })
    if (profileError) throw profileError
    return { success: true, message: 'Committee administrator is ready.' }
  } catch (error) {
    console.error('[v0] Admin provisioning failed:', error)
    return { success: false, message: 'Could not provision the administrator account.' }
  }
}
