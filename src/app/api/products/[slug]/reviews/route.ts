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

  const { searchParams } = new URL(req.url)
  const rating = searchParams.get("rating")

  let query = `
    SELECT
      r.id,
      r.rating,
      r.comment,
      r.images,
      r.is_purchased,
      r.created_at,
      u.name
    FROM product_reviews r
    JOIN users u ON r.user_id = u.id
    WHERE r.product_id = $1
  `

  const values: any[] = [productId]

  if (rating) {
    query += ` AND r.rating = $2`
    values.push(rating)
  }

  query += ` ORDER BY r.created_at DESC`

  // Thay đổi dòng cuối cùng
const reviews = await sql.query(query, values);

  return NextResponse.json(reviews)
}*/

import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> } // Khai báo params là Promise
) {
  // 1. Phải await params trước khi lấy slug
  const { slug } = await params;

  // 2. Sử dụng Tagged Template (sql`...`) để lấy productId
  const productResult = await sql`SELECT id FROM products WHERE slug = ${slug}`
  
  if (productResult.length === 0) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 })
  }
  const productId = productResult[0].id

  const { searchParams } = new URL(req.url)
  const rating = searchParams.get("rating")

  let query = `
    SELECT r.id, r.rating, r.comment, r.images, r.is_purchased, r.created_at, u.name
    FROM product_reviews r
    JOIN users u ON r.user_id = u.id
    WHERE r.product_id = $1
  `
  const values: any[] = [productId]

  if (rating) {
    query += ` AND r.rating = $2`
    values.push(rating)
  }

  query += ` ORDER BY r.created_at DESC`

  // 3. Sử dụng sql.query() cho các câu lệnh ghép chuỗi động
  const reviews = await sql.query(query, values)

  return NextResponse.json(reviews)
}