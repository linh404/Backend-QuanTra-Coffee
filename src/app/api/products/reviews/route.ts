// src/app/api/products/reviews/route.ts
import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  return NextResponse.json(
    { success: false, error: 'Reviews are not supported by the current MySQL schema' },
    { status: 501 }
  );
}