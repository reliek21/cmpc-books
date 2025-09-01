import { NextRequest, NextResponse } from 'next/server';

const backendUrl = process.env.BASE_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET() {
  try {
    const response = await fetch(`${backendUrl}/api/v1/books/deleted`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Deleted Books API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deleted books' },
      { status: 500 }
    );
  }
}
