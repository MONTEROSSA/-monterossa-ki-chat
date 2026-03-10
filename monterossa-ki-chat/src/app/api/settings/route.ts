import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - Get chat settings
export async function GET() {
  try {
    let settings = await prisma.chatSettings.findFirst();
    
    // Create default settings if not exist
    if (!settings) {
      settings = await prisma.chatSettings.create({
        data: {
          welcomeMessage: 'Willkommen bei Monterossa AG! 👋\n\nIch bin Ihr KI-Chat Agent. Wie kann ich Ihnen helfen?'
        }
      });
    }

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json({ success: false, error: 'Fehler beim Laden' }, { status: 500 });
  }
}

// PUT - Update chat settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      welcomeMessage, 
      companyName, 
      primaryColor, 
      accentColor,
      transferEnabled,
      transferEmail,
      transferPhone 
    } = body;

    let settings = await prisma.chatSettings.findFirst();

    if (settings) {
      settings = await prisma.chatSettings.update({
        where: { id: settings.id },
        data: {
          welcomeMessage,
          companyName,
          primaryColor,
          accentColor,
          transferEnabled,
          transferEmail,
          transferPhone
        }
      });
    } else {
      settings = await prisma.chatSettings.create({
        data: {
          welcomeMessage,
          companyName: companyName || 'Monterossa AG',
          primaryColor: primaryColor || '#22d3bb',
          accentColor: accentColor || '#f97316',
          transferEnabled: transferEnabled ?? true,
          transferEmail,
          transferPhone
        }
      });
    }

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json({ success: false, error: 'Fehler beim Speichern' }, { status: 500 });
  }
}
