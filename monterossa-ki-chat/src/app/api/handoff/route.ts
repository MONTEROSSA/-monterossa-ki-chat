import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - List handoff requests
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const handoffs = await prisma.humanHandoff.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    return NextResponse.json({ success: true, data: handoffs });
  } catch (error) {
    console.error('Handoff fetch error:', error);
    return NextResponse.json({ success: false, error: 'Fehler beim Laden' }, { status: 500 });
  }
}

// POST - Create handoff request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, reason, customerName, customerEmail, customerPhone, message, voiceNoteUrl } = body;

    const handoff = await prisma.humanHandoff.create({
      data: {
        sessionId: sessionId || `session-${Date.now()}`,
        reason: reason || 'Kunde wünscht Mitarbeiter-Kontakt',
        customerName,
        customerEmail,
        customerPhone,
        message,
        voiceNoteUrl
      }
    });

    // Update session if exists
    if (sessionId) {
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: { transferred: true, transferReason: reason }
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, data: handoff });
  } catch (error) {
    console.error('Handoff create error:', error);
    return NextResponse.json({ success: false, error: 'Fehler beim Erstellen' }, { status: 500 });
  }
}

// PUT - Update handoff status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'ID und Status erforderlich' }, { status: 400 });
    }

    const handoff = await prisma.humanHandoff.update({
      where: { id },
      data: {
        status,
        resolvedAt: status === 'resolved' ? new Date() : null
      }
    });

    return NextResponse.json({ success: true, data: handoff });
  } catch (error) {
    console.error('Handoff update error:', error);
    return NextResponse.json({ success: false, error: 'Fehler beim Aktualisieren' }, { status: 500 });
  }
}
