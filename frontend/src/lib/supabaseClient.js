import { createClient } from '@supabase/supabase-js'

// Estas credenciales las obtienes en el Panel de Supabase -> Project Settings -> API
const supabaseUrl = 'https://rvakwlqsorljlffunqcw.supabase.co'
const supabaseAnonKey = 'sb_publishable_yra2HdV_JKWc6whtj4JdXA_NCmDfUFYcd ..'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)