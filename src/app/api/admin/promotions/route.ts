import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getUserFromToken } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication required' 
        },
        { status: 401 }
      )
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Admin access required' 
        },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = Number(searchParams.get('limit')) || 5
    const page = Number(searchParams.get('page')) || 1
    const offset = (page - 1) * limit

    // Get all products to allow toggling promotions
    try {
      const promotions = await sql`
        SELECT 
          p.id,
          p.name,
          p.description,
          p.price,
          p.sale_price,
          p.is_sale,
          p.category_id,
          p.image_url,
          p.stock,
          p.is_active,
          p.created_at,
          c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        ORDER BY p.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `

      const countResult = await sql`SELECT COUNT(*) as total FROM products`
      const total = Number(countResult[0].total)

      return NextResponse.json({
        success: true,
        data: promotions || [],
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      })
    } catch (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({
        success: true,
        data: [],
        pagination: { page: 1, limit: 5, total: 0, totalPages: 0 }
      })
    }
  } catch (error) {
    console.error('Error fetching admin promotions:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch promotions' 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication required' 
        },
        { status: 401 }
      )
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Admin access required' 
        },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { 
      productId, 
      salePrice
    } = body

    // Update product to set it on sale
    await sql`
      UPDATE products 
      SET 
        is_sale = true,
        sale_price = ${salePrice}
      WHERE id = ${productId}
    `

    const updatedProduct = await sql`
      SELECT id, name, slug, brand, description, category_id, is_active, price, image_url, created_at, updated_at, sale_price, stock, is_sale
      FROM products
      WHERE id = ${productId}
      LIMIT 1
    `

    return NextResponse.json({
      success: true,
      data: updatedProduct[0]
    })
  } catch (error) {
    console.error('Error creating promotion:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create promotion' 
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication required' 
        },
        { status: 401 }
      )
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Admin access required' 
        },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { productId, isSale } = body

    // Update product sale status
    await sql`
      UPDATE products 
      SET is_sale = ${isSale}
      WHERE id = ${productId}
    `

    const updatedProduct = await sql`
      SELECT id, name, slug, brand, description, category_id, is_active, price, image_url, created_at, updated_at, sale_price, stock, is_sale
      FROM products
      WHERE id = ${productId}
      LIMIT 1
    `

    return NextResponse.json({
      success: true,
      data: updatedProduct[0]
    })
  } catch (error) {
    console.error('Error updating promotion:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update promotion' 
      },
      { status: 500 }
    )
  }
}
