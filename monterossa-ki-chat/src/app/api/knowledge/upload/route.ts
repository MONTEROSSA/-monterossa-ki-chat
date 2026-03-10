import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const category = formData.get('category') as string | null;
    const tags = formData.get('tags') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'Keine Datei hochgeladen', success: false },
        { status: 400 }
      );
    }

    // Determine file type
    const mimeType = file.type;
    let type = 'file';
    
    if (mimeType.startsWith('image/')) {
      type = 'image';
    } else if (mimeType.startsWith('video/')) {
      type = 'video';
    } else if (mimeType === 'application/pdf') {
      type = 'file';
    } else if (mimeType.includes('word') || mimeType.includes('document')) {
      type = 'file';
    } else if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
      type = 'file';
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${originalName}`;
    const filePath = path.join(uploadsDir, fileName);

    // Write file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Create knowledge item
    const item = await prisma.knowledgeItem.create({
      data: {
        type,
        title: file.name,
        content: null,
        url: `/uploads/${fileName}`,
        fileName: file.name,
        fileSize: file.size,
        mimeType,
        category: category || 'Allgemein',
        tags: tags || null,
        active: true
      }
    });

    return NextResponse.json({ 
      item, 
      url: `/uploads/${fileName}`,
      success: true 
    });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Hochladen der Datei', success: false },
      { status: 500 }
    );
  }
}
