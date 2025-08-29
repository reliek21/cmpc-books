"use client"

import { GalleryVerticalEnd } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from '@/components/ui/input';
import { useAuth } from "@/contexts/auth-context";

const registerSchema = z.object({
  first_name: z.string().min(2, 'First name must be at least 2 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
    .regex(/\d/, 'Password must contain at least one number'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true)
    setError('root', { message: '' })

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError('root', { message: errorData.error || 'Registration failed' });
        return;
      }

      const responseData = await response.json();

      // Store auth data in localStorage (similar to login)
      if (responseData.access_token && responseData.user) {
        localStorage.setItem('auth-token', responseData.access_token);
        localStorage.setItem('user', JSON.stringify(responseData.user));

        // Redirect to dashboard after successful registration
        router.push('/dashboard');
      } else {
        // Fallback: redirect to login with success message
        router.push('/auth/login?message=Registration successful, please login');
      }
    } catch (err) {
      setError('root', { message: 'Registration failed' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <a
              href="#"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex size-8 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-6" />
              </div>
            </a>
            <h1 className="text-xl font-bold">Welcome to CMPC.</h1>
            <div className="text-center text-sm">
              Already have an account?{" "}
              <a href="/auth/login" className="underline underline-offset-4">
                Sign in
              </a>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {errors.root && (
              <div className="text-red-500 text-sm text-center">
                {errors.root.message}
              </div>
            )}
            <div className="grid gap-1">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                type="text"
                placeholder="John"
                {...register('first_name')}
              />
              {errors.first_name && <p className="text-red-500 text-sm">{errors.first_name.message}</p>}
            </div>
            <div className="grid gap-1">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                type="text"
                placeholder="Doe"
                {...register('last_name')}
              />
              {errors.last_name && <p className="text-red-500 text-sm">{errors.last_name.message}</p>}
            </div>
            <div className="grid gap-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                {...register('email')}
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>
            <div className="grid gap-1">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                {...register('password')}
              />
              {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
