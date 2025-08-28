"use client"

import React, { useState } from 'react'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

function SocialButton({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <button
      type="button"
      className={"flex-1 inline-flex items-center justify-center gap-2 border rounded-md px-4 py-2 bg-white text-sm " + (className || '')}
    >
      {children}
    </button>
  )
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loginSchema = z.object({
    email: z.string().email('Correo inválido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validar con Zod antes de enviar
    const parsed = loginSchema.safeParse({ email, password })
    if (!parsed.success) {
      const first = parsed.error.errors[0]
      setLoading(false)
      setError(first?.message || 'Datos inválidos')
      return
    }

    try {
      const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'
      const res = await fetch(`${backend}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const body = await res.json().catch(() => null)

      if (!res.ok) {
        if (res.status === 400) setError(body?.message || 'Bad request')
        else if (res.status === 401) setError(body?.message || 'Invalid credentials')
        else setError(body?.message || 'Login failed')
        return
      }

      const data = body
      if (data?.access_token) {
        localStorage.setItem('access_token', data.access_token)
      }
      window.location.href = '/'
    } catch (err: any) {
      setError(err?.message || 'Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold">Sign in to your account</h2>
        <p className="text-sm text-gray-500 mt-1">Use your email below to login</p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <SocialButton>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 .198a8 8 0 00-2.53 15.59c.4.074.547-.174.547-.387 0-.19-.007-.693-.01-1.36-2.225.483-2.695-1.073-2.695-1.073-.364-.924-.89-1.17-.89-1.17-.727-.497.055-.487.055-.487.803.057 1.226.825 1.226.825.714 1.223 1.873.87 2.33.665.072-.517.28-.87.508-1.07-1.777-.202-3.644-.888-3.644-3.953 0-.873.312-1.588.824-2.148-.083-.203-.357-1.017.078-2.12 0 0 .67-.215 2.2.82A7.66 7.66 0 018 4.58c.68.003 1.366.092 2.006.27 1.53-1.035 2.2-.82 2.2-.82.435 1.103.16 1.917.08 2.12.513.56.823 1.275.823 2.148 0 3.073-1.87 3.748-3.65 3.945.288.248.543.737.543 1.486 0 1.073-.01 1.94-.01 2.203 0 .214.146.463.55.384A8 8 0 008 .198z" fill="#111"/>
            </svg>
            <span className="text-sm text-gray-700">GitHub</span>
          </SocialButton>

          <SocialButton>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21.6 12.23c0-.72-.06-1.42-.18-2.09H12v3.95h5.7c-.25 1.34-1 2.48-2.13 3.25v2.7h3.45c2.02-1.86 3.18-4.6 3.18-7.81z" fill="#4285F4"/>
              <path d="M12 22c2.7 0 4.96-.9 6.62-2.44l-3.45-2.7c-.96.65-2.2 1.03-3.17 1.03-2.44 0-4.51-1.65-5.25-3.88H2.96v2.43C4.6 19.9 8.06 22 12 22z" fill="#34A853"/>
              <path d="M6.75 13.01A6.994 6.994 0 016.5 12c0-.33.03-.66.06-.99V8.58H2.96A9.998 9.998 0 002 12c0 1.6.38 3.11 1.05 4.42l2.7-3.41z" fill="#FBBC05"/>
              <path d="M12 6.5c1.47 0 2.8.5 3.84 1.48l2.88-2.88C16.95 3.54 14.7 2.5 12 2.5 8.06 2.5 4.6 4.6 2.96 7.58l3.6 2.43C7.49 8.15 9.56 6.5 12 6.5z" fill="#EA4335"/>
            </svg>
            <span className="text-sm text-gray-700">Google</span>
          </SocialButton>
        </div>

        <div className="flex items-center gap-4 my-5">
          <div className="h-px bg-gray-200 flex-1" />
          <div className="text-xs text-gray-400">OR CONTINUE WITH</div>
          <div className="h-px bg-gray-200 flex-1" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700">Email</label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="m@example.com" required />
          </div>

          <div>
            <label className="block text-sm text-gray-700">Password</label>
            <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="" required />
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <div>
            <Button type="submit" className="w-full bg-black hover:opacity-90 rounded-full py-3">{loading ? 'Signing in...' : 'Sign in'}</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
