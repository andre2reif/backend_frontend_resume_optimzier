import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json(
        { error: 'Benutzer-ID ist erforderlich' },
        { status: 400 }
      );
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    const response = await fetch(
      `${apiUrl}/api/v1/jobdescriptions/view?user_id=${user_id}`,
      { method: 'GET' }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Fehler beim Laden der Stellenausschreibungen');
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in jobdescription view route:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
} 