import { NextRequest, NextResponse } from 'next/server';

const BASE_API_URL = process.env.BASE_API_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const response = await fetch(`${BASE_API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.message || 'Login failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
