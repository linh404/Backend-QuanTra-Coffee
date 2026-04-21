import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const products = await sql`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.slug = ${slug}
    `

    if (products.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Product not found' 
        },
        { status: 404 }
      )
    }

    const product = products[0]

    // Get images for this product
    const images = await sql`
      SELECT id, url, is_main
      FROM product_images
      WHERE product_id = ${product.id}
      ORDER BY is_main DESC, id ASC
    `

    // Get tags for this product
    const tags = await sql`
      SELECT t.id, t.name, t.slug
      FROM tags t
      JOIN product_tags_map ptm ON t.id = ptm.tag_id
      WHERE ptm.product_id = ${product.id}
      ORDER BY t.name ASC
    `

    // Map database fields to frontend format
    const mappedProduct = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      brand: product.brand,
      shortDescription: product.short_description,
      description: product.description,
      price: product.price,
      salePrice: product.sale_price,
      isSale: product.is_sale || false,
      stock: product.stock || 0,
      imageUrl: product.image_url,
      images: images.map(img => ({
        id: img.id,
        url: img.url,
        isMain: img.is_main
      })),
      tags: tags.map(tag => ({
        id: tag.id,
        name: tag.name,
        slug: tag.slug
      })),
      category: {
        id: product.category_id,
        name: product.category_name,
        slug: product.category_slug
      },
      createdAt: product.created_at,
      updatedAt: product.updated_at
    }

    return NextResponse.json({
      success: true,
      data: mappedProduct
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch product' 
      },
      { status: 500 }
    )
  }
}
