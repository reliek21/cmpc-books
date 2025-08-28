import type { NextApiRequest, NextApiResponse } from 'next'

// This is a mock API route to demo frontend-login behavior. Replace with your real backend endpoint.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' })

  const { email, password } = req.body;
  // Simple demo validation
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' })

  // Proxy to real backend if available
  try {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
    const r = await fetch(`${backend}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await r.json();
    return res.status(r.status).json(data);
  } catch (err) {
    return res.status(500).json({ message: 'Backend proxy failed' })
  }
}
