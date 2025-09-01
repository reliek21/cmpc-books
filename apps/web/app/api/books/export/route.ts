import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get authorization token from request headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    console.log('📤 CSV Export API Hit! Forwarding to backend...');
    console.log('Export params:', Object.fromEntries(searchParams.entries()));

    // Call backend CSV export endpoint
    const backendUrl = process.env.BASE_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const backendResponse = await fetch(`${backendUrl}/api/v1/books/export.csv?${searchParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!backendResponse.ok) {
      console.error('Backend CSV export failed:', backendResponse.status);
      const errorText = await backendResponse.text();
      console.error('Backend error:', errorText);
      return NextResponse.json(
        { error: 'Failed to export CSV from backend' },
        { status: backendResponse.status }
      );
    }

    // Get the CSV content from backend
    const csvContent = await backendResponse.text();
    console.log('✅ CSV export successful, content length:', csvContent.length);

    // Return the CSV content with appropriate headers
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv;charset=utf-8;',
        'Content-Disposition': 'attachment; filename="books.csv"',
      },
    });
  } catch (error) {
    console.error('CSV Export API Error:', error);
    return NextResponse.json(
      { error: 'Failed to export CSV' },
      { status: 500 }
    );
  }
}
