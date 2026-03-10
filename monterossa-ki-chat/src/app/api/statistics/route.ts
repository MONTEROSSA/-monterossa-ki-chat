import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - Get statistics
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const range = searchParams.get('range') || '7d'; // 7d, 30d, 90d, all

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    switch (range) {
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case 'all':
        startDate = new Date('2020-01-01');
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // Get daily stats
    const dailyStats = await prisma.dailyStats.findMany({
      where: { date: { gte: startDate } },
      orderBy: { date: 'asc' }
    });

    // Get messages for analysis
    const messages = await prisma.message.findMany({
      where: { createdAt: { gte: startDate } }
    });

    // Get FAQ items
    const faqItems = await prisma.fAQItem.findMany({
      orderBy: { frequency: 'desc' },
      take: 10
    });

    // Calculate totals
    const totalSessions = dailyStats.reduce((sum, d) => sum + d.totalSessions, 0);
    const totalMessages = dailyStats.reduce((sum, d) => sum + d.totalMessages, 0);
    const totalTransfers = dailyStats.reduce((sum, d) => sum + d.transfers, 0);
    const positiveRatings = dailyStats.reduce((sum, d) => sum + d.positiveRatings, 0);
    const negativeRatings = dailyStats.reduce((sum, d) => sum + d.negativeRatings, 0);
    const totalRatings = positiveRatings + negativeRatings;
    
    // Calculate average rating
    const ratedMessages = messages.filter(m => m.rating !== null);
    const avgRating = ratedMessages.length > 0
      ? ratedMessages.reduce((sum, m) => sum + (m.rating || 0), 0) / ratedMessages.length
      : null;

    // Satisfaction rate
    const satisfactionRate = totalRatings > 0
      ? Math.round((positiveRatings / totalRatings) * 100)
      : null;

    // Get handoff stats
    const handoffs = await prisma.humanHandoff.findMany({
      where: { createdAt: { gte: startDate } }
    });
    const pendingHandoffs = handoffs.filter(h => h.status === 'pending').length;

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalSessions,
          totalMessages,
          totalTransfers,
          avgRating,
          satisfactionRate,
          positiveRatings,
          negativeRatings,
          pendingHandoffs
        },
        dailyStats: dailyStats.map(d => ({
          date: d.date.toISOString().split('T')[0],
          sessions: d.totalSessions,
          messages: d.totalMessages,
          avgRating: d.avgRating,
          transfers: d.transfers
        })),
        topQuestions: faqItems.map(f => ({
          question: f.question,
          answer: f.answer,
          frequency: f.frequency,
          avgRating: f.avgRating
        }))
      }
    });
  } catch (error) {
    console.error('Statistics fetch error:', error);
    return NextResponse.json({ success: false, error: 'Fehler beim Laden' }, { status: 500 });
  }
}
