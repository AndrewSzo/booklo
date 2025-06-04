import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // System prompt for book-related AI assistant
    const systemPrompt = `You are Booklo AI, an intelligent assistant specializing in books and literature. You help users with:
    - Book summaries and analysis
    - Book recommendations based on preferences
    - Reading insights and literary discussions
    - Author information and book comparisons
    
    ${context ? `Context about user's library: ${context}` : ''}
    
    Provide helpful, accurate, and engaging responses about books and reading.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      response,
      usage: completion.usage 
    });

  } catch (error) {
    console.error('AI Chat error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 