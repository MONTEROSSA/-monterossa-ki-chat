import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - Get messages for a session
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID ist erforderlich', success: false },
        { status: 400 }
      );
    }

    const messages = await prisma.message.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json({ messages, success: true });
  } catch (error) {
    console.error('Messages GET Error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Nachrichten', success: false },
      { status: 500 }
    );
  }
}

// POST - Create new message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      sessionId, 
      role, 
      content, 
      hasAttachment, 
      attachmentUrl, 
      attachmentName,
      isVoiceMessage,
      voiceMessageUrl,
      knowledgeUsed 
    } = body;

    if (!sessionId || !role || !content) {
      return NextResponse.json(
        { error: 'Session ID, Rolle und Inhalt sind erforderlich', success: false },
        { status: 400 }
      );
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        sessionId,
        role,
        content,
        hasAttachment: hasAttachment || false,
        attachmentUrl: attachmentUrl || null,
        attachmentName: attachmentName || null,
        isVoiceMessage: isVoiceMessage || false,
        voiceMessageUrl: voiceMessageUrl || null,
        knowledgeUsed: knowledgeUsed || null
      }
    });

    return NextResponse.json({ message, success: true });
  } catch (error) {
    console.error('Messages POST Error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Speichern der Nachricht', success: false },
      { status: 500 }
    );
  }
}

// PUT - Update message (e.g., add rating)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, rating, ratingComment } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID ist erforderlich', success: false },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (rating !== undefined) updateData.rating = rating;
    if (ratingComment !== undefined) updateData.ratingComment = ratingComment;

    const message = await prisma.message.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ message, success: true });
  } catch (error) {
    console.error('Messages PUT Error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Nachricht', success: false },
      { status: 500 }
    );
  }
}
