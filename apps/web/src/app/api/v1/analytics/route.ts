import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Analytics API - Not implemented' }, { status: 501 });
}
