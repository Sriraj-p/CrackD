// ─────────────────────────────────────────────────────────
// FILE: frontend/src/lib/supabase.js
// ─────────────────────────────────────────────────────────
// Replaces the old supabase.js entirely.
// Uses runtime config instead of build-time VITE_ env vars.

import { createClient } from '@supabase/supabase-js'
import { getConfig } from '../config'

let _supabase = null

export function getSupabase() {
  if (!_supabase) {
    const { supabaseUrl, supabaseAnonKey } = getConfig()
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase URL or Anon Key missing from runtime config')
      return null
    }
    _supabase = createClient(supabaseUrl, supabaseAnonKey)
  }
  return _supabase
}