import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - List all knowledge items
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const active = searchParams.get('active');
    
    const where: Record<string, unknown> = {};
    if (category) where.category = category;
    if (active !== null) where.active = active === 'true';

    const items = await prisma.knowledgeItem.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error('Knowledge fetch error:', error);
    return NextResponse.json({ success: false, error: 'Fehler beim Laden' }, { status: 500 });
  }
}

// POST - Create new knowledge item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, title, content, url, fileName, fileSize, mimeType, category, tags } = body;

    if (!type || !title) {
      return NextResponse.json({ success: false, error: 'Typ und Titel sind erforderlich' }, { status: 400 });
    }

    const item = await prisma.knowledgeItem.create({
      data: {
        type,
        title,
        content: content || null,
        url: url || null,
        fileName: fileName || null,
        fileSize: fileSize || null,
        mimeType: mimeType || null,
        category: category || null,
        tags: tags || null
      }
    });

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error('Knowledge create error:', error);
    return NextResponse.json({ success: false, error: 'Fehler beim Erstellen' }, { status: 500 });
  }
}

// PUT - Update knowledge item
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID ist erforderlich' }, { status: 400 });
    }

    const item = await prisma.knowledgeItem.update({
      where: { id },
      data
    });

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error('Knowledge update error:', error);
    return NextResponse.json({ success: false, error: 'Fehler beim Aktualisieren' }, { status: 500 });
  }
}

// DELETE - Delete knowledge item
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID ist erforderlich' }, { status: 400 });
    }

    await prisma.knowledgeItem.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Knowledge delete error:', error);
    return NextResponse.json({ success: false, error: 'Fehler beim Löschen' }, { status: 500 });
  }
}
