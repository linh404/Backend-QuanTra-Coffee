import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getUserFromToken } from '@/lib/auth-utils'

/**
 * Tạo slug từ string
 */
function createSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * GET /api/admin/products/[id]/tags
 * Lấy danh sách tags của product
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const productId = parseInt(id)

    if (!productId || productId <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid product ID' },
        { status: 400 }
      )
    }

    // Kiểm tra product tồn tại
    const products = await sql`
      SELECT id FROM products WHERE id = ${productId}
    `

    if (products.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    // Lấy tags qua join với product_tags_map
    const tags = await sql`
      SELECT t.id, t.name, t.slug
      FROM tags t
      JOIN product_tags_map ptm ON t.id = ptm.tag_id
      WHERE ptm.product_id = ${productId}
      ORDER BY t.name ASC
    `

    return NextResponse.json({
      success: true,
      data: tags,
      total: tags.length
    })
  } catch (error) {
    console.error('Error fetching product tags:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product tags' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/products/[id]/tags
 * Thêm tag cho product (hoặc tạo tag mới nếu không tồn tại)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromToken(request)
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { id } = await params
    const productId = parseInt(id)
    const { name } = await request.json()

    if (!productId || productId <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid product ID' },
        { status: 400 }
      )
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Tag name is required' },
        { status: 400 }
      )
    }

    // Kiểm tra product tồn tại
    const products = await sql`
      SELECT id FROM products WHERE id = ${productId}
    `

    if (products.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    const tagName = name.trim()
    const tagSlug = createSlug(tagName)

    // Lấy hoặc tạo tag
    let tags = await sql`
      SELECT id FROM tags WHERE slug = ${tagSlug}
    `

    let tagId
    if (tags.length === 0) {
      // Tạo tag mới
      await sql`
        INSERT INTO tags (name, slug)
        VALUES (${tagName}, ${tagSlug})
      `

      tags = await sql`
        SELECT id FROM tags WHERE slug = ${tagSlug}
      `
      tagId = tags[0].id
    } else {
      tagId = tags[0].id
    }

    // Kiểm tra product đã có tag này chưa
    const mapping = await sql`
      SELECT id FROM product_tags_map
      WHERE product_id = ${productId} AND tag_id = ${tagId}
    `

    if (mapping.length > 0) {
      return NextResponse.json(
        { success: false, error: 'This tag is already assigned to the product' },
        { status: 400 }
      )
    }

    // Thêm tag vào product
    await sql`
      INSERT INTO product_tags_map (product_id, tag_id)
      VALUES (${productId}, ${tagId})
    `

    // Lấy tag vừa thêm
    const tag = await sql`
      SELECT id, name, slug FROM tags WHERE id = ${tagId}
    `

    return NextResponse.json({
      success: true,
      message: 'Tag added successfully',
      data: tag[0]
    })
  } catch (error) {
    console.error('Error adding product tag:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add product tag' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/products/[id]/tags/[tagId]
 * Xóa tag khỏi product
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; tagId: string }> }
) {
  try {
    const user = getUserFromToken(request)
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { id, tagId } = await params
    const productId = parseInt(id)
    const tagIdNum = parseInt(tagId)

    if (!productId || !tagIdNum) {
      return NextResponse.json(
        { success: false, error: 'Invalid product or tag ID' },
        { status: 400 }
      )
    }

    // Kiểm tra mapping tồn tại
    const mapping = await sql`
      SELECT id FROM product_tags_map
      WHERE product_id = ${productId} AND tag_id = ${tagIdNum}
    `

    if (mapping.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Tag not found for this product' },
        { status: 404 }
      )
    }

    // Xóa mapping
    await sql`
      DELETE FROM product_tags_map
      WHERE product_id = ${productId} AND tag_id = ${tagIdNum}
    `

    return NextResponse.json({
      success: true,
      message: 'Tag removed successfully'
    })
  } catch (error) {
    console.error('Error deleting product tag:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete product tag' },
      { status: 500 }
    )
  }
}
