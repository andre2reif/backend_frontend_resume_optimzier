import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json(
        { error: 'Benutzer-ID ist erforderlich' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/jobdescription/delete/${params.id}?user_id=${user_id}`,
      { method: 'DELETE' }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Fehler beim Löschen der Stellenausschreibung');
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in jobdescription delete route:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
} 