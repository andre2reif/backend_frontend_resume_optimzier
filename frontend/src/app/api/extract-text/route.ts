'use server';

import { NextRequest, NextResponse } from 'next/server';
import PdfParser from 'pdf2json';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'Keine Datei gefunden' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const text = await extractTextFromPDF(buffer);

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error('Fehler bei der PDF-Verarbeitung:', error);
    return NextResponse.json(
      { error: error.message || 'Fehler bei der PDF-Verarbeitung' },
      { status: 500 }
    );
  }
}

function extractTextFromPDF(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const pdfParser = new PdfParser(null);
    
    pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
      try {
        const text = decodeURIComponent(pdfData.Pages
          .map((page: any) => page.Texts
            .map((text: any) => text.R
              .map((r: any) => r.T)
              .join(' '))
            .join(' '))
          .join('\n'));
        
        resolve(text);
      } catch (error) {
        reject(new Error('Fehler bei der PDF-Textextraktion: ' + error));
      }
    });
    
    pdfParser.on('pdfParser_dataError', (errData: any) => {
      reject(new Error('Fehler beim PDF-Parsing: ' + errData.parserError));
    });
    
    pdfParser.parseBuffer(buffer);
  });
} 