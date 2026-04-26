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

    // Get average and total
    const stats = await sql`
      SELECT 
        COUNT(*) as totalReviews,
        AVG(rating) as averageRating
      FROM product_reviews
      WHERE product_id = ${productId}
    `;

    const { totalReviews, averageRating } = stats[0] as any;

    // Get rating distribution
    const distribution = await sql`
      SELECT rating, COUNT(*) as count
      FROM product_reviews
      WHERE product_id = ${productId}
      GROUP BY rating
    `;

    const ratingCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    (distribution as any[]).forEach((row: any) => {
      ratingCounts[row.rating] = Number(row.count);
    });

    return NextResponse.json({
      success: true,
      data: {
        totalReviews: Number(totalReviews) || 0,
        averageRating: Number(averageRating) || 0,
        ratingCounts
      }
    });
  } catch (error: any) {
    console.error('Error fetching review summary:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}