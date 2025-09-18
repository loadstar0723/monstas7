import { NextRequest, NextResponse } from 'next/server';

const GO_BACKEND_URL = process.env.GO_BACKEND_URL || 'http://localhost:8092';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${GO_BACKEND_URL}/api/v1/ai/models/status`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Go backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching AI model status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI model status from Go backend' },
      { status: 500 }
    );
  }
}