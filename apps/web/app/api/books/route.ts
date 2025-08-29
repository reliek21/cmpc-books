import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Build query parameters for the backend
    const params = new URLSearchParams();

    // Map frontend parameters to backend parameters
    searchParams.forEach((value, key) => {
      if (value) {
        // Map parameter names
        let backendKey = key;
        if (key === 'pageSize') {
          backendKey = 'per_page';
        } else if (key === 'q') {
          backendKey = 'search';
        }
        params.append(backendKey, value);
      }
    });

    // Call backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/books?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();

    // Map backend response to frontend format
    const mappedData = {
      items: data.data || [],
      total: data.total || 0,
      page: data.page || 1,
      perPage: data.per_page || 10,
      totalPages: data.total_pages || 1,
    };

    return NextResponse.json(mappedData);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch books' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const bookData = await request.json();

    // Get authorization token from request headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Call backend API with authentication
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/books`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(bookData),
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const error = await response.json();
        return NextResponse.json(
          { error: error.message || 'Failed to create book' },
          { status: response.status }
        );
      } else {
        const errorText = await response.text();
        console.error('Non-JSON error response:', errorText);
        return NextResponse.json(
          { error: 'Failed to create book' },
          { status: response.status }
        );
      }
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to create book' },
      { status: 500 }
    );
  }
}
