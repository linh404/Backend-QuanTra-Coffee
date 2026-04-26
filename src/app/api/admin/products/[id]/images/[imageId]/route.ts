import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getUserFromToken } from '@/lib/auth-utils'

/**
 * PUT /api/admin/products/[id]/images/[imageId]
 * Cập nhật hình ảnh (đặt làm ảnh chính)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const user = await getUserFromToken(request)
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { id, imageId } = await params
    const productId = parseInt(id)
    const imageIdNum = parseInt(imageId)
    const { isMain } = await request.json()

    if (!productId || !imageIdNum) {
      return NextResponse.json(
        { success: false, error: 'Invalid product or image ID' },
        { status: 400 }
      )
    }

    // Kiểm tra ảnh tồn tại và thuộc product
    const images = await sql`
      SELECT id FROM product_images
      WHERE id = ${imageIdNum} AND product_id = ${productId}
    `

    if (images.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Image not found' },
        { status: 404 }
      )
    }

    const isMainBoolean = isMain === true

    // Nếu set là main, bỏ main từ các ảnh khác của cùng sản phẩm
    if (isMainBoolean) {
      await sql`
        UPDATE product_images
        SET is_main = false
        WHERE product_id = ${productId} AND id != ${imageIdNum}
      `
    }

    // Cập nhật ảnh hiện tại
    await sql`
      UPDATE product_images
      SET is_main = ${isMainBoolean}
      WHERE id = ${imageIdNum}
    `

    // Lấy ảnh đã cập nhật
    const updated = await sql`
      SELECT id, product_id, url, is_main
      FROM product_images
      WHERE id = ${imageIdNum}
    `

    return NextResponse.json({
      success: true,
      message: 'Image updated successfully',
      data: updated[0]
    })
  } catch (error) {
    console.error('Error updating product image:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update product image' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/products/[id]/images/[imageId]
 * Xóa hình ảnh
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const user = await getUserFromToken(request)
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { id, imageId } = await params
    const productId = parseInt(id)
    const imageIdNum = parseInt(imageId)

    if (!productId || !imageIdNum) {
      return NextResponse.json(
        { success: false, error: 'Invalid product or image ID' },
        { status: 400 }
      )
    }

    // Kiểm tra ảnh tồn tại
    const images = await sql`
      SELECT id, is_main FROM product_images
      WHERE id = ${imageIdNum} AND product_id = ${productId}
    `

    if (images.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Image not found' },
        { status: 404 }
      )
    }

    // Xóa ảnh
    await sql`
      DELETE FROM product_images
      WHERE id = ${imageIdNum}
    `

    // Nếu vừa xóa ảnh main, tự động set ảnh cũ nhất còn lại làm main
    if (images[0].is_main) {
      const remainingImages = await sql`
        SELECT id FROM product_images
        WHERE product_id = ${productId}
        ORDER BY id ASC
        LIMIT 1
      `

      if (remainingImages.length > 0) {
        await sql`
          UPDATE product_images
          SET is_main = true
          WHERE id = ${remainingImages[0].id}
        `
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting product image:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete product image' },
      { status: 500 }
    )
  }
}
