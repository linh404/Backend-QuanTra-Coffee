import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

type ProductRow = {
  id: number
  name: string
  slug: string
  brand: string | null
  short_description: string | null
  description: string | null
  price: number
  sale_price: number | null
  is_sale: boolean | null
  stock: number | null
  image_url: string | null
  category_id: number | null
  category_name: string | null
  category_slug: string | null
  total_sold: number
}

export async function GET() {
  try {
    // Fetch products ordered by total quantity sold in order_items
    // Fallback to newest products if no sales data exists
    const products = await sql`
      SELECT 
        p.*, 
        c.name as category_name, 
        c.slug as category_slug,
        COALESCE((SELECT SUM(qty) FROM order_items WHERE product_id = p.id), 0) as total_sold
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = true
      ORDER BY total_sold DESC, p.created_at DESC
      LIMIT 4
    `

    const mappedProducts = (products as ProductRow[]).map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      brand: product.brand,
      shortDescription: product.short_description,
      description: product.description,
      price: product.price,
      salePrice: product.sale_price,
      isSale: !!product.is_sale,
      stock: product.stock || 0,
      imageUrl: product.image_url,
      images: [],
      category: {
        id: product.category_id,
        name: product.category_name,
        slug: product.category_slug
      },
      totalSold: Number(product.total_sold)
    }))

    return NextResponse.json({
      success: true,
      data: mappedProducts
    })
  } catch (error) {
    console.error('Best Selling API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch best selling products' },
      { status: 500 }
    )
  }
}
