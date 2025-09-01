import { NextRequest, NextResponse } from 'next/server';

const backendUrl = process.env.BASE_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get authorization token from request headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    const response = await fetch(`${backendUrl}/api/v1/books/${id}/restore`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const error = await response.json();
        return NextResponse.json(
          { error: error.message || 'Failed to restore book' },
          { status: response.status }
        );
      } else {
        return NextResponse.json(
          { error: 'Failed to restore book' },
          { status: response.status }
        );
      }
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Restore API Error:', error);
    return NextResponse.json(
      { error: 'Failed to restore book' },
      { status: 500 }
    );
  }
}
