// ─────────────────────────────────────────────────────────
// FILE: frontend/src/config.js
// ─────────────────────────────────────────────────────────
// Runtime config loader.
// In production: fetches config from backend /api/config endpoint.
// In local dev: falls back to VITE_ env vars from .env file.

let _config = null

export async function loadConfig() {
  if (_config) return _config

  // Local dev: use Vite env vars if available
  if (import.meta.env.DEV && import.meta.env.VITE_SUPABASE_URL) {
    _config = {
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
      supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    }
    return _config
  }

  // Production: fetch from backend
  const res = await fetch('/api/config')
  if (!res.ok) throw new Error('Failed to load app config')
  _config = await res.json()
  return _config
}

export function getConfig() {
  if (!_config) throw new Error('Config not loaded — call loadConfig() first')
  return _config
}