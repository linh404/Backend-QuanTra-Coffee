// src/app/api/products/reviews/route.ts
import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { product_id, user_id, rating, comment, images, is_purchased } = body;

    // Ép kiểu logic theo yêu cầu:
    // Nếu chưa mua (is_purchased = false), rating và images phải là null hoặc rỗng
    const finalRating = is_purchased ? rating : null;
    const finalImages = is_purchased ? images : [];

    const result = await sql`
      INSERT INTO product_reviews (product_id, user_id, rating, comment, images, is_purchased)
      VALUES (${product_id}, ${user_id}, ${finalRating}, ${comment}, ${finalImages}, ${is_purchased})
      RETURNING *
    `;

    return NextResponse.json({ success: true, data: result[0] });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ success: false, error: 'Lỗi gửi đánh giá' }, { status: 500 });
  }
}