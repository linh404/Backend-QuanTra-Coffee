import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json(
    { error: 'Reviews are not supported by the current MySQL schema' },
    { status: 501 }
  )
}