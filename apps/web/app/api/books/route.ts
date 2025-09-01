import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');
  
  console.log('=== API Route Debug ===');
  console.log('Full URL:', request.url);
  console.log('Endpoint param:', endpoint);
  console.log('All params:', Object.fromEntries(searchParams.entries()));
  
  if (endpoint === 'filters') {
    console.log('🎯 FILTERS ENDPOINT HIT! Forwarding to backend...');
    
    try {
      const backendUrl = process.env.BASE_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const backendResponse = await fetch(`${backendUrl}/api/v1/books/filters`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!backendResponse.ok) {
        console.error('Backend filters request failed:', backendResponse.status);
        return NextResponse.json(
          { error: 'Failed to fetch filters from backend' },
          { status: backendResponse.status }
        );
      }

      const filtersData = await backendResponse.json();
      console.log('✅ Backend filters response:', filtersData);
      
      return NextResponse.json(filtersData);
    } catch (error) {
      console.error('Error fetching filters from backend:', error);
      return NextResponse.json(
        { error: 'Failed to fetch filters' },
        { status: 500 }
      );
    }
  }
  
  // Handle regular books endpoint (no endpoint parameter or regular request)
  console.log('📚 BOOKS ENDPOINT HIT! Forwarding to backend...');
  
  try {
    const backendUrl = process.env.BASE_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const backendResponse = await fetch(`${backendUrl}/api/v1/books?${searchParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!backendResponse.ok) {
      console.error('Backend books request failed:', backendResponse.status);
      return NextResponse.json(
        { error: 'Failed to fetch books from backend' },
        { status: backendResponse.status }
      );
    }

    const booksData = await backendResponse.json();
    console.log('✅ Backend books response:', booksData);
    
    return NextResponse.json(booksData);
  } catch (error) {
    console.error('Error fetching books from backend:', error);
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
    const backendUrl = process.env.BASE_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/api/v1/books`, {
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
