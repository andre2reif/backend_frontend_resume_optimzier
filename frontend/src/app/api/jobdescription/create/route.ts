import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const user_id = formData.get('user_id') as string;

    if (!title || !content || !user_id) {
      return NextResponse.json(
        { error: 'Titel, Inhalt und Benutzer-ID sind erforderlich' },
        { status: 400 }
      );
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    const response = await fetch(`${apiUrl}/api/v1/jobdescriptions/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        title,
        content,
        user_id,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Fehler beim Erstellen der Stellenausschreibung');
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in jobdescription create route:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
} 