import { NextResponse } from 'next/server'

export const runtime = 'edge';

export async function GET() {
  return NextResponse.json(
    { 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    },
    { status: 200 }
  );
} 