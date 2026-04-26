import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Get product ID from slug
    const products = await sql`SELECT id FROM products WHERE slug = ${slug}`;
    if (products.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const productId = products[0].id;

    // Fetch reviews with user names
    const reviews = await sql`
      SELECT 
        pr.id,
        pr.rating,
        pr.comment,
        pr.created_at,
        u.name as user_name
      FROM product_reviews pr
      JOIN users u ON pr.user_id = u.id
      WHERE pr.product_id = ${productId}
      ORDER BY pr.created_at DESC
    `;

    return NextResponse.json({
      success: true,
      data: reviews
    });
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}