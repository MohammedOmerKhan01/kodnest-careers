import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Resume API - Not implemented' }, { status: 501 });
}
