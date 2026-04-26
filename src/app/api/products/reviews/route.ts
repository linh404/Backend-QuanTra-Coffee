// src/app/api/products/reviews/route.ts
import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth-utils';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { productId, rating, comment } = body;

    if (!productId || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Invalid productId or rating (1-5 required)' },
        { status: 400 }
      );
    }

    // Check if product exists
    const products = await sql`SELECT id FROM products WHERE id = ${productId}`;
    if (products.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Insert review
    await sql`
      INSERT INTO product_reviews (product_id, user_id, rating, comment)
      VALUES (${productId}, ${user.userId}, ${rating}, ${comment || null})
    `;

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully'
    });
  } catch (error: any) {
    console.error('Error submitting review:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

