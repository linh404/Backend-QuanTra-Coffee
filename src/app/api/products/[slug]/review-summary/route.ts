/*import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  // First get product_id from slug
  const productResult = await sql`SELECT id FROM products WHERE slug = ${params.slug}`
  if (productResult.length === 0) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 })
  }
  const productId = productResult[0].id

  const result = await sql`
  SELECT 
    AVG(rating) as avg_rating, 
    COUNT(*) as total_reviews 
  FROM product_reviews 
  WHERE product_id = ${productId}
`;

  return NextResponse.json(result[0])
}*/

import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const productResult = await sql`SELECT id FROM products WHERE slug = ${slug}`;
  if (productResult.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const productId = productResult[0].id;

  // Lấy trung bình cộng và tổng số lượt đánh giá
  const stats = await sql`
    SELECT 
      AVG(rating) as avg_rating, 
      COUNT(*) as total_reviews 
    FROM product_reviews 
    WHERE product_id = ${productId} AND rating IS NOT NULL
  `;

  // Lấy chi tiết số lượng từng mức sao (giống logic vòng lặp PHP của bạn)
  const ratingCounts = await sql`
    SELECT rating, COUNT(*) as count
    FROM product_reviews
    WHERE product_id = ${productId} AND rating IS NOT NULL
    GROUP BY rating
  `;

  return NextResponse.json({
    average: parseFloat(stats[0].avg_rating || 0).toFixed(1),
    total: parseInt(stats[0].total_reviews || 0),
    counts: ratingCounts // Trả về mảng các mức sao để tính % ở frontend
  });
}