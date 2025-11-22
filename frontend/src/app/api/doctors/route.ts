import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const specialty = searchParams.get('specialty');
    const location = searchParams.get('location');
    const search = searchParams.get('search');

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    let url = `${backendUrl}/api/doctors`;

    const params = new URLSearchParams();
    if (specialty) params.append('specialty', specialty);
    if (location) params.append('location', location);
    if (search) params.append('search', search);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';

    let url = `${backendUrl}/api/doctors`;
    let response;

    if (body.endpoint === 'specialties') {
      response = await fetch(`${url}/specialties`);
    } else if (body.endpoint === 'locations') {
      response = await fetch(`${url}/locations`);
    } else if (body.endpoint === 'search') {
      response = await fetch(`${url}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
    } else {
      // Default search
      response = await fetch(url);
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}