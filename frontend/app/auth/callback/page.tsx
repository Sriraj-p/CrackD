'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    const handleCallback = async () => {
      const { error } = await supabase.auth.getSession()
      if (error) {
        router.replace('/login?error=auth_callback_error')
        return
      }
      // Supabase client library automatically exchanges the code from the URL hash
      router.replace('/analysis-center')
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground font-sans">Completing sign in...</p>
      </div>
    </div>
  )
}
