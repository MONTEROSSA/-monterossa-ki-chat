import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { prisma } from '@/lib/db';

// Base system prompt for the Monterossa AG Chatbot
const BASE_SYSTEM_PROMPT = `Du bist ein professioneller virtueller Assistent der Monterossa AG.

Über Monterossa AG:
- Monterossa AG ist ein innovatives Unternehmen, das sich auf digitale Lösungen und Technologie-Dienstleistungen spezialisiert hat
- Wir bieten maßgeschneiderte Software-Entwicklung, IT-Beratung und digitale Transformationsdienstleistungen an
- Unser Team besteht aus erfahrenen Experten, die leidenschaftlich daran arbeiten, die besten Lösungen für unsere Kunden zu entwickeln

Deine Aufgaben:
- Beantworte Fragen zum Unternehmen und unseren Dienstleistungen
- Sei stets professionell, freundlich und hilfsbereit
- Verwende eine höfliche und angemessene Sprache
- Wenn du etwas nicht weißt, gib ehrlich zu, dass du die Information nicht hast
- Biete an, einen Mitarbeiter zu kontaktieren, wenn spezifischere Informationen benötigt werden

Kommunikationsstil:
- Professionell aber zugänglich
- Verwende "Sie" als Anrede
- Sei präzise und hilfsbereit
- Zeige Verständnis für die Anliegen der Kunden`;

// Simple text similarity function
function simpleSimilarity(text1: string, text2: string): number {
  const words1 = text1.toLowerCase().split(/\s+/);
  const words2 = text2.toLowerCase().split(/\s+/);
  
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return union.size > 0 ? intersection.size / union.size : 0;
}

// Search knowledge base for relevant items
async function searchKnowledgeBase(query: string, limit: number = 5) {
  try {
    const items = await prisma.knowledgeItem.findMany({
      where: { active: true }
    });

    // Score each item
    const scoredItems = items.map(item => {
      const titleScore = simpleSimilarity(query, item.title) * 2;
      const contentScore = item.content ? simpleSimilarity(query, item.content) : 0;
      const tagsScore = item.tags ? simpleSimilarity(query, item.tags) * 1.5 : 0;
      
      return {
        item,
        score: Math.max(titleScore, contentScore, tagsScore)
      };
    });

    // Sort by score and return top results
    return scoredItems
      .filter(s => s.score > 0.1)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(s => s.item);
  } catch (error) {
    console.error('Knowledge search error:', error);
    return [];
  }
}

// Build system prompt with knowledge context
function buildSystemPrompt(knowledgeContext: string[], welcomeMessage?: string): string {
  let prompt = BASE_SYSTEM_PROMPT;
  
  if (welcomeMessage) {
    prompt += `\n\nBegrüssungsnachricht (verwende diese für die erste Begrüssung):\n${welcomeMessage}`;
  }
  
  if (knowledgeContext.length > 0) {
    const knowledgeSection = knowledgeContext.map((ctx, i) => `[${i + 1}] ${ctx}`).join('\n\n');
    prompt += `\n\nRelevante Informationen aus der Wissensdatenbank:\n${knowledgeSection}\n\nVerwende diese Informationen, um präzise und hilfreiche Antworten zu geben. Wenn die Informationen nicht ausreichen, weise darauf hin und biete an, einen Mitarbeiter zu kontaktieren.`;
  }
  
  return prompt;
}

// Update FAQ statistics
async function updateFAQStats(question: string, answer: string, rating?: number) {
  try {
    // Normalize question
    const normalizedQuestion = question.toLowerCase().trim();
    
    // Find existing FAQ
    const existingFAQ = await prisma.fAQItem.findFirst({
      where: { question: { contains: normalizedQuestion.substring(0, 50) } }
    });
    
    if (existingFAQ) {
      // Update frequency and rating
      const newAvgRating = rating 
        ? ((existingFAQ.avgRating || 0) * existingFAQ.frequency + rating) / (existingFAQ.frequency + 1)
        : existingFAQ.avgRating;
      
      await prisma.fAQItem.update({
        where: { id: existingFAQ.id },
        data: {
          frequency: existingFAQ.frequency + 1,
          avgRating: newAvgRating,
          lastAsked: new Date()
        }
      });
    } else {
      // Create new FAQ
      await prisma.fAQItem.create({
        data: {
          question: normalizedQuestion,
          answer: answer.substring(0, 500),
          frequency: 1,
          avgRating: rating
        }
      });
    }
  } catch (error) {
    console.error('FAQ update error:', error);
  }
}

// Update daily statistics
async function updateDailyStats() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const stats = await prisma.dailyStats.findUnique({
      where: { date: today }
    });
    
    if (stats) {
      await prisma.dailyStats.update({
        where: { id: stats.id },
        data: { totalMessages: stats.totalMessages + 1 }
      });
    } else {
      await prisma.dailyStats.create({
        data: {
          date: today,
          totalSessions: 1,
          totalMessages: 1
        }
      });
    }
  } catch (error) {
    console.error('Stats update error:', error);
  }
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  messages: Message[];
  sessionId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { messages, sessionId } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Nachrichten sind erforderlich' },
        { status: 400 }
      );
    }

    // Get chat settings
    const settings = await prisma.chatSettings.findFirst();
    
    // Get the last user message for knowledge search
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    let relevantKnowledge: string[] = [];
    let knowledgeIds: string[] = [];

    if (lastUserMessage) {
      const knowledgeItems = await searchKnowledgeBase(lastUserMessage.content);
      relevantKnowledge = knowledgeItems.map(item => {
        let context = `Titel: ${item.title}`;
        if (item.content) context += `\nInhalt: ${item.content}`;
        if (item.url) context += `\nURL: ${item.url}`;
        return context;
      });
      knowledgeIds = knowledgeItems.map(item => item.id);
    }

    // Build system prompt with knowledge context
    const systemPrompt = buildSystemPrompt(relevantKnowledge, settings?.welcomeMessage);

    // Initialize the AI SDK
    const zai = await ZAI.create();

    // Create chat completion with conversation history
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }))
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const assistantMessage = completion.choices[0]?.message?.content || 
      'Es tut mir leid, ich konnte keine Antwort generieren. Bitte versuchen Sie es erneut.';

    // Store messages and update stats
    if (lastUserMessage) {
      try {
        // Update daily stats
        await updateDailyStats();
        
        // Update FAQ
        await updateFAQStats(lastUserMessage.content, assistantMessage);

        // Store message if session ID provided
        if (sessionId) {
          await prisma.message.create({
            data: {
              sessionId,
              role: 'user',
              content: lastUserMessage.content,
              knowledgeUsed: knowledgeIds.length > 0 ? knowledgeIds.join(',') : null
            }
          });

          await prisma.message.create({
            data: {
              sessionId,
              role: 'assistant',
              content: assistantMessage,
              knowledgeUsed: knowledgeIds.length > 0 ? knowledgeIds.join(',') : null
            }
          });
        }
      } catch (dbError) {
        console.error('Storage error:', dbError);
      }
    }

    return NextResponse.json({
      message: assistantMessage,
      knowledgeUsed: knowledgeIds.length,
      success: true
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.',
        success: false 
      },
      { status: 500 }
    );
  }
}

// PUT - Rate a message
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { messageId, rating, comment, sessionId } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, error: 'Bewertung zwischen 1-5 erforderlich' }, { status: 400 });
    }

    // Update message rating
    if (messageId) {
      await prisma.message.update({
        where: { id: messageId },
        data: { rating, ratingComment: comment }
      });
    }

    // Update daily stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const stats = await prisma.dailyStats.findUnique({
      where: { date: today }
    });
    
    if (stats) {
      const isPositive = rating >= 4;
      await prisma.dailyStats.update({
        where: { id: stats.id },
        data: {
          positiveRatings: stats.positiveRatings + (isPositive ? 1 : 0),
          negativeRatings: stats.negativeRatings + (isPositive ? 0 : 1),
          avgRating: ((stats.avgRating || 0) * (stats.positiveRatings + stats.negativeRatings) + rating) / 
                     (stats.positiveRatings + stats.negativeRatings + 1)
        }
      });
    }

    // If negative rating, create AI learning entry
    if (rating < 3) {
      const lastMessages = await prisma.message.findMany({
        where: { sessionId },
        orderBy: { createdAt: 'desc' },
        take: 2
      });
      
      if (lastMessages.length >= 2) {
        const userMsg = lastMessages.find(m => m.role === 'user');
        const assistantMsg = lastMessages.find(m => m.role === 'assistant');
        
        if (userMsg && assistantMsg) {
          await prisma.aILearning.create({
            data: {
              question: userMsg.content,
              originalAnswer: assistantMsg.content,
              rating
            }
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Rating error:', error);
    return NextResponse.json({ success: false, error: 'Fehler beim Speichern der Bewertung' }, { status: 500 });
  }
}
