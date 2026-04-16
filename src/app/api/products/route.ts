import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

type ProductRow = {
  id: number
  name: string
  slug: string
  brand: string | null
  description: string | null
  price: number
  sale_price: number | null
  is_sale: boolean | null
  stock: number | null
  image_url: string | null
  gallery: string[] | null
  category_id: number | null
  category_name: string | null
  category_slug: string | null
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number(searchParams.get('limit') || searchParams.get('pageSize')) || 10
    const page = Number(searchParams.get('page')) || 1
    const offset = (page - 1) * limit
    const rawQuery = searchParams.get('q')?.trim() || ''
    const query = rawQuery ? `%${rawQuery}%` : ''
    const categoryId = Number(searchParams.get('category'))
    const minPrice = Number(searchParams.get('minPrice'))
    const maxPrice = Number(searchParams.get('maxPrice'))
    const saleOnly = searchParams.get('sale') === 'true'
    const sortBy = searchParams.get('sortBy') || 'price_asc'

    const sortClause = (() => {
      switch (sortBy) {
        case 'price_desc':
          return sql`ORDER BY COALESCE(NULLIF(p.sale_price, 0), p.price) DESC, p.id DESC`
        case 'name_asc':
          return sql`ORDER BY p.name ASC, p.id DESC`
        case 'name_desc':
          return sql`ORDER BY p.name DESC, p.id DESC`
        case 'newest':
          return sql`ORDER BY p.created_at DESC, p.id DESC`
        case 'price_asc':
        default:
          return sql`ORDER BY COALESCE(NULLIF(p.sale_price, 0), p.price) ASC, p.id DESC`
      }
    })()

    const searchClause = rawQuery
      ? sql`AND (
          p.name ILIKE ${query}
        )`
      : sql``

    const products = await sql`
      SELECT p.*, c.name as category_name, c.slug as category_slug,
        (SELECT json_agg(pi.image_url) FROM product_images pi WHERE pi.product_id = p.id) as gallery
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = true
      ${searchClause}
      ${Number.isFinite(categoryId) && categoryId > 0 ? sql`AND p.category_id = ${categoryId}` : sql``}
      ${Number.isFinite(minPrice) && minPrice > 0 ? sql`AND COALESCE(NULLIF(p.sale_price, 0), p.price) >= ${minPrice}` : sql``}
      ${Number.isFinite(maxPrice) && maxPrice > 0 ? sql`AND COALESCE(NULLIF(p.sale_price, 0), p.price) <= ${maxPrice}` : sql``}
      ${saleOnly ? sql`AND p.is_sale = true AND p.sale_price IS NOT NULL AND p.sale_price > 0` : sql``}
      ${sortClause}
      LIMIT ${limit} OFFSET ${offset}
    `

    const countResult = await sql`
      SELECT COUNT(*) as total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = true
      ${searchClause}
      ${Number.isFinite(categoryId) && categoryId > 0 ? sql`AND p.category_id = ${categoryId}` : sql``}
      ${Number.isFinite(minPrice) && minPrice > 0 ? sql`AND COALESCE(NULLIF(p.sale_price, 0), p.price) >= ${minPrice}` : sql``}
      ${Number.isFinite(maxPrice) && maxPrice > 0 ? sql`AND COALESCE(NULLIF(p.sale_price, 0), p.price) <= ${maxPrice}` : sql``}
      ${saleOnly ? sql`AND p.is_sale = true AND p.sale_price IS NOT NULL AND p.sale_price > 0` : sql``}
    `
    const total = Number(countResult[0].total)

    const mappedProducts = (products as ProductRow[]).map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      brand: product.brand,
      description: product.description,
      price: product.price,
      salePrice: product.sale_price,
      isSale: product.is_sale || false,
      stock: product.stock || 0,
      imageUrl: product.image_url,
      gallery: product.gallery || [],
      category: {
        id: product.category_id,
        name: product.category_name,
        slug: product.category_slug
      }
    }))

    return NextResponse.json({
      success: true,
      data: mappedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
