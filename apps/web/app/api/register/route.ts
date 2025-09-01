import { NextRequest, NextResponse } from 'next/server';

const BASE_API_URL = process.env.BASE_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    const { first_name, last_name, email, password } = await request.json();

    const response = await fetch(`${BASE_API_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ first_name, last_name, email, password }),
    });

    if (!response.ok) {
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const error = await response.json();
        return NextResponse.json(
          { error: error.message || 'Registration failed' },
          { status: response.status }
        );
      } else {
        // If not JSON, it might be HTML error page
        const errorText = await response.text();
        console.error('Non-JSON error response:', errorText);
        return NextResponse.json(
          { error: 'Registration failed' },
          { status: response.status }
        );
      }
    }

    // Registration successful - backend returns auth tokens
    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Register API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
