"use client"

import React, { useState } from 'react'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const registerSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido'),
    email: z.string().email('Correo inválido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirmPassword: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    setError(null)
    // Validación con Zod
    const parsed = registerSchema.safeParse({ name, email, password, confirmPassword })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || 'Datos inválidos')
      return
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    try {
      const backend = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      const url = backend ? `${backend}/auth/register` : '/api/auth/register'
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setError(data?.message || 'Error al registrar usuario.')
      } else {
        setMessage('Registro exitoso. Revisa tu correo o inicia sesión.')
        setName('')
        setEmail('')
        setPassword('')
        setConfirmPassword('')
      }
    } catch (err) {
      setError('No se pudo conectar al servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold">Create an account</h2>
        <p className="text-sm text-gray-500 mt-1">Enter your email below to create your account</p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div>
            <button type="button" className="w-full flex items-center justify-center gap-2 border rounded-md px-4 py-2 bg-white text-sm">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 .198a8 8 0 00-2.53 15.59c.4.074.547-.174.547-.387 0-.19-.007-.693-.01-1.36-2.225.483-2.695-1.073-2.695-1.073-.364-.924-.89-1.17-.89-1.17-.727-.497.055-.487.055-.487.803.057 1.226.825 1.226.825.714 1.223 1.873.87 2.33.665.072-.517.28-.87.508-1.07-1.777-.202-3.644-.888-3.644-3.953 0-.873.312-1.588.824-2.148-.083-.203-.357-1.017.078-2.12 0 0 .67-.215 2.2.82A7.66 7.66 0 018 4.58c.68.003 1.366.092 2.006.27 1.53-1.035 2.2-.82 2.2-.82.435 1.103.16 1.917.08 2.12.513.56.823 1.275.823 2.148 0 3.073-1.87 3.748-3.65 3.945.288.248.543.737.543 1.486 0 1.073-.01 1.94-.01 2.203 0 .214.146.463.55.384A8 8 0 008 .198z" fill="#111"/>
              </svg>
              <span className="text-sm text-gray-700">GitHub</span>
            </button>
          </div>

          <div>
            <button type="button" className="w-full flex items-center justify-center gap-2 border rounded-md px-4 py-2 bg-white text-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.6 12.23c0-.72-.06-1.42-.18-2.09H12v3.95h5.7c-.25 1.34-1 2.48-2.13 3.25v2.7h3.45c2.02-1.86 3.18-4.6 3.18-7.81z" fill="#4285F4"/>
                <path d="M12 22c2.7 0 4.96-.9 6.62-2.44l-3.45-2.7c-.96.65-2.2 1.03-3.17 1.03-2.44 0-4.51-1.65-5.25-3.88H2.96v2.43C4.6 19.9 8.06 22 12 22z" fill="#34A853"/>
                <path d="M6.75 13.01A6.994 6.994 0 016.5 12c0-.33.03-.66.06-.99V8.58H2.96A9.998 9.998 0 002 12c0 1.6.38 3.11 1.05 4.42l2.7-3.41z" fill="#FBBC05"/>
                <path d="M12 6.5c1.47 0 2.8.5 3.84 1.48l2.88-2.88C16.95 3.54 14.7 2.5 12 2.5 8.06 2.5 4.6 4.6 2.96 7.58l3.6 2.43C7.49 8.15 9.56 6.5 12 6.5z" fill="#EA4335"/>
              </svg>
              <span className="text-sm text-gray-700">Google</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 my-5">
          <div className="h-px bg-gray-200 flex-1" />
          <div className="text-xs text-gray-400">OR CONTINUE WITH</div>
          <div className="h-px bg-gray-200 flex-1" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {message && <div className="text-green-600">{message}</div>}
          {error && <div className="text-red-600">{error}</div>}

          <div>
            <label className="block text-sm text-gray-700">Email</label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="m@example.com" required />
          </div>

          <div>
            <label className="block text-sm text-gray-700">Password</label>
            <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="" required minLength={6} />
          </div>

          <div>
            <label className="block text-sm text-gray-700">Confirm password</label>
            <Input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" placeholder="" required minLength={6} />
          </div>

          <div>
            <Button type="submit" className="w-full bg-black hover:opacity-90 rounded-full py-3">{loading ? 'Creating...' : 'Create account'}</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
