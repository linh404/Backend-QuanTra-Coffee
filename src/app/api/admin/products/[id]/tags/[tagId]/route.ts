import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getUserFromToken } from '@/lib/auth-utils'

/**
 * DELETE /api/admin/products/[id]/tags/[tagId]
 * Xóa tag khỏi sản phẩm
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; tagId: string }> }
) {
  try {
    const user = await getUserFromToken(request)
    
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

    // Kiểm tra mapping tồn tại giữa sản phẩm và tag
    const mapping = await sql`
      SELECT id FROM product_tags_map
      WHERE product_id = ${productId} AND tag_id = ${tagIdNum}
    `

    if (mapping.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Tag mapping not found for this product' },
        { status: 404 }
      )
    }

    // Xóa liên kết tag-sản phẩm
    await sql`
      DELETE FROM product_tags_map
      WHERE product_id = ${productId} AND tag_id = ${tagIdNum}
    `

    return NextResponse.json({
      success: true,
      message: 'Tag removed from product successfully'
    })
  } catch (error) {
    console.error('Error removing product tag:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to remove product tag' },
      { status: 500 }
    )
  }
}
