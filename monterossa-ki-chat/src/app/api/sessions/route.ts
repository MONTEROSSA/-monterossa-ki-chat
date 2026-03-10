import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - Get all sessions or specific session
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('id');

    if (sessionId) {
      // Get specific session with messages
      const session = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' }
          }
        }
      });

      if (!session) {
        return NextResponse.json(
          { error: 'Session nicht gefunden', success: false },
          { status: 404 }
        );
      }

      return NextResponse.json({ session, success: true });
    }

    // Get all sessions
    const sessions = await prisma.chatSession.findMany({
      include: {
        messages: {
          select: {
            id: true,
            role: true,
            createdAt: true,
            rating: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ sessions, success: true });
  } catch (error) {
    console.error('Sessions GET Error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Sessions', success: false },
      { status: 500 }
    );
  }
}

// POST - Create new session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { visitorId, userAgent, ipAddress, country } = body;

    const session = await prisma.chatSession.create({
      data: {
        visitorId: visitorId || null,
        userAgent: userAgent || null,
        ipAddress: ipAddress || null,
        country: country || null
      }
    });

    return NextResponse.json({ session, success: true });
  } catch (error) {
    console.error('Sessions POST Error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Session', success: false },
      { status: 500 }
    );
  }
}

// PUT - Update session (e.g., end session)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, endedAt, feedbackLeft } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID ist erforderlich', success: false },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (endedAt !== undefined) updateData.endedAt = endedAt ? new Date(endedAt) : null;
    if (feedbackLeft !== undefined) updateData.feedbackLeft = feedbackLeft;

    const session = await prisma.chatSession.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ session, success: true });
  } catch (error) {
    console.error('Sessions PUT Error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Session', success: false },
      { status: 500 }
    );
  }
}
