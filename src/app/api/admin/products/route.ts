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

    // Get all products with category information
    const products = await sql`
      SELECT 
        p.id,
        p.name,
        p.slug,
        p.short_description as shortDescription,
        p.description,
        p.price,
        p.sale_price as salePrice,
        p.is_sale as isSale,
        p.brand,
        p.category_id as categoryId,
        p.image_url as imageUrl,
        p.stock,
        p.is_active as isActive,
        p.created_at as createdAt,
        p.updated_at as updatedAt,
        c.name as categoryName
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    const countResult = await sql`SELECT COUNT(*) as total FROM products`
    const total = Number(countResult[0].total)


    // Get images and tags for each product
    const productsWithRelations = await Promise.all(
      products.map(async (product) => {
        const [images, tags] = await Promise.all([
          sql`
            SELECT id, url, is_main as isMain
            FROM product_images
            WHERE product_id = ${product.id}
            ORDER BY isMain DESC, id ASC
          `,
          sql`
            SELECT t.id, t.name, t.slug
            FROM tags t
            JOIN product_tags_map ptm ON t.id = ptm.tag_id
            WHERE ptm.product_id = ${product.id}
            ORDER BY t.name ASC
          `
        ])
        return {
          ...product,
          images,
          tags
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: productsWithRelations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching admin products:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch products' 
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
      name, 
      shortDescription, 
      description, 
      price, 
      categoryId, 
      imageUrl, 
      stock, 
      brand, 
      salePrice,
      isSale
    } = body

    // Validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product name is required' },
        { status: 400 }
      )
    }

    if (!price || price < 0) {
      return NextResponse.json(
        { success: false, error: 'Product price is required and must be >= 0' },
        { status: 400 }
      )
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Convert categoryId to number or null
    const categoryIdNum = categoryId && categoryId !== '' ? parseInt(categoryId, 10) : null

    // Determine is_sale: true if salePrice exists and is > 0
    const isSaleBoolean = salePrice && salePrice > 0 ? true : false
    const salePriceNum = isSaleBoolean ? salePrice : null

    // Insert new product
    await sql`
      INSERT INTO products (
        name, slug, short_description, description, price, sale_price, is_sale,
        category_id, image_url, stock, brand, is_active, created_at, updated_at
      )
      VALUES (
        ${name}, ${slug}, ${shortDescription || null}, ${description || null}, 
        ${price}, ${salePriceNum}, ${isSaleBoolean},
        ${categoryIdNum}, ${imageUrl || null}, ${stock || 0}, ${brand || null}, 
        true, NOW(), NOW()
      )
    `

    const createdProduct = await sql`
      SELECT 
        id, name, slug, brand, short_description as shortDescription, description, category_id as categoryId, 
        is_active as isActive, price, sale_price as salePrice, is_sale as isSale, image_url as imageUrl, stock, 
        created_at as createdAt, updated_at as updatedAt
      FROM products
      WHERE slug = ${slug}
      LIMIT 1
    `

    const product = createdProduct[0]

    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      data: {
        ...product,
        images: [],
        tags: []
      }
    })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create product' 
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
    const { 
      id, 
      name, 
      shortDescription,
      description, 
      price, 
      categoryId, 
      imageUrl, 
      stock, 
      brand, 
      salePrice 
    } = body

    // Validation
    if (!id || id <= 0) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      )
    }

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product name is required' },
        { status: 400 }
      )
    }

    if (!price || price < 0) {
      return NextResponse.json(
        { success: false, error: 'Product price must be >= 0' },
        { status: 400 }
      )
    }

    // Check product exists
    const existingProducts = await sql`
      SELECT id FROM products WHERE id = ${id}
    `

    if (existingProducts.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Convert categoryId to number or null
    const categoryIdNum = categoryId && categoryId !== '' ? parseInt(categoryId, 10) : null

    // Determine is_sale: true if salePrice exists and is > 0
    const isSaleBoolean = salePrice && salePrice > 0 ? true : false
    const salePriceNum = isSaleBoolean ? salePrice : null

    // Update product
    await sql`
      UPDATE products 
      SET 
        name = ${name},
        slug = ${slug},
        short_description = ${shortDescription || null},
        description = ${description || null},
        price = ${price},
        sale_price = ${salePriceNum},
        is_sale = ${isSaleBoolean},
        category_id = ${categoryIdNum},
        image_url = ${imageUrl || null},
        stock = ${stock || 0},
        brand = ${brand || null},
        updated_at = NOW()
      WHERE id = ${id}
    `

    const updatedProduct = await sql`
      SELECT 
        id, name, slug, brand, short_description as shortDescription, description, category_id as categoryId, 
        is_active as isActive, price, sale_price as salePrice, is_sale as isSale, image_url as imageUrl, stock, 
        created_at as createdAt, updated_at as updatedAt
      FROM products
      WHERE id = ${id}
      LIMIT 1
    `

    if (updatedProduct.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Product not found' 
        },
        { status: 404 }
      )
    }

    const product = updatedProduct[0]

    // Get images and tags
    const [images, tags] = await Promise.all([
      sql`
        SELECT id, url, is_main as isMain
        FROM product_images
        WHERE product_id = ${id}
        ORDER BY isMain DESC, id ASC
      `,
      sql`
        SELECT t.id, t.name, t.slug
        FROM tags t
        JOIN product_tags_map ptm ON t.id = ptm.tag_id
        WHERE ptm.product_id = ${id}
        ORDER BY t.name ASC
      `
    ])

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      data: {
        ...product,
        images,
        tags
      }
    })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update product' 
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
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
    const { id } = body

    // Delete product
    const existingProduct = await sql`
      SELECT id, name, slug, brand, description, category_id, is_active, price, image_url, created_at, updated_at, sale_price, stock, is_sale
      FROM products
      WHERE id = ${id}
      LIMIT 1
    `

    if (existingProduct.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Product not found' 
        },
        { status: 404 }
      )
    }

    await sql`
      DELETE FROM products
      WHERE id = ${id}
    `

    return NextResponse.json({
      success: true,
      data: existingProduct[0]
    })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete product' 
      },
      { status: 500 }
    )
  }
}
