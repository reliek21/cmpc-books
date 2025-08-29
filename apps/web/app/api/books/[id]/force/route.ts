import { NextRequest, NextResponse } from 'next/server';

const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const response = await fetch(`${backendUrl}/books/${id}/force`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const error = await response.json();
        return NextResponse.json(
          { error: error.message || 'Failed to permanently delete book' },
          { status: response.status }
        );
      } else {
        return NextResponse.json(
          { error: 'Failed to permanently delete book' },
          { status: response.status }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Force Delete API Error:', error);
    return NextResponse.json(
      { error: 'Failed to permanently delete book' },
      { status: 500 }
    );
  }
}
