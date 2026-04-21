import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getUserFromToken } from '@/lib/auth-utils'

/**
 * GET /api/admin/products/[id]/images
 * Lấy danh sách hình ảnh của product
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

    // Lấy toàn bộ hình ảnh, is_main = true sẽ ở đầu tiên
    const images = await sql`
      SELECT id, product_id, url, is_main
      FROM product_images
      WHERE product_id = ${productId}
      ORDER BY is_main DESC, id ASC
    `

    return NextResponse.json({
      success: true,
      data: images,
      total: images.length
    })
  } catch (error) {
    console.error('Error fetching product images:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product images' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/products/[id]/images
 * Thêm hình ảnh mới cho product
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
    const { url, isMain } = await request.json()

    if (!productId || productId <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid product ID' },
        { status: 400 }
      )
    }

    if (!url || typeof url !== 'string' || url.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Image URL is required' },
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

    const isMainBoolean = isMain === true

    // Nếu set là main, bỏ main từ các ảnh khác
    if (isMainBoolean) {
      await sql`
        UPDATE product_images
        SET is_main = false
        WHERE product_id = ${productId}
      `
    }

    // Thêm ảnh mới
    await sql`
      INSERT INTO product_images (product_id, url, is_main)
      VALUES (${productId}, ${url.trim()}, ${isMainBoolean})
    `

    // Lấy ảnh vừa thêm
    const images = await sql`
      SELECT id, product_id, url, is_main
      FROM product_images
      WHERE product_id = ${productId}
      ORDER BY id DESC
      LIMIT 1
    `

    return NextResponse.json({
      success: true,
      message: 'Image added successfully',
      data: images[0]
    })
  } catch (error) {
    console.error('Error adding product image:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add product image' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/products/[id]/images/[imageId]
 * Cập nhật hình ảnh (thay đổi is_main)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const user = getUserFromToken(request)
    
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

    // Nếu set là main, bỏ main từ các ảnh khác
    if (isMainBoolean) {
      await sql`
        UPDATE product_images
        SET is_main = false
        WHERE product_id = ${productId} AND id != ${imageIdNum}
      `
    }

    // Cập nhật ảnh
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
    const user = getUserFromToken(request)
    
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

    // Nếu xóa ảnh main, set ảnh đầu tiên làm main
    if (images[0].is_main) {
      const firstImage = await sql`
        SELECT id FROM product_images
        WHERE product_id = ${productId}
        ORDER BY id ASC
        LIMIT 1
      `

      if (firstImage.length > 0) {
        await sql`
          UPDATE product_images
          SET is_main = true
          WHERE id = ${firstImage[0].id}
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
