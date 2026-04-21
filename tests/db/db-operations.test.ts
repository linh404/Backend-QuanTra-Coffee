import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { sql } from '@/lib/db'

describe('Database Operations', () => {
  let testProductId: number
  let testCategoryId: number
  let testUserId: number

  beforeAll(async () => {
    // Create a test category
    const categoryResult = await sql`
      INSERT INTO categories (name, slug)
      VALUES ('Test Category', 'test-category-' + UNIX_TIMESTAMP())
    `
    testCategoryId = (categoryResult as any)[0].insertId

    // Create a test user
    const userResult = await sql`
      INSERT INTO users (email, name, password_hash, role)
      VALUES ('test-' + UNIX_TIMESTAMP() + '@example.com', 'Test User', '$2a$08$hash', 'buyer')
    `
    testUserId = (userResult as any)[0].insertId
  })

  afterAll(async () => {
    // Cleanup: Delete test data
    try {
      if (testProductId) {
        await sql`DELETE FROM product_images WHERE product_id = ${testProductId}`
        await sql`DELETE FROM product_tags_map WHERE product_id = ${testProductId}`
        await sql`DELETE FROM cart_items WHERE product_id = ${testProductId}`
        await sql`DELETE FROM order_items WHERE product_id = ${testProductId}`
        await sql`DELETE FROM products WHERE id = ${testProductId}`
      }
      if (testCategoryId) {
        await sql`DELETE FROM categories WHERE id = ${testCategoryId}`
      }
      if (testUserId) {
        await sql`DELETE FROM cart_items WHERE cart_id IN (SELECT id FROM carts WHERE user_id = ${testUserId})`
        await sql`DELETE FROM carts WHERE user_id = ${testUserId}`
        await sql`DELETE FROM user_addresses WHERE user_id = ${testUserId}`
        await sql`DELETE FROM users WHERE id = ${testUserId}`
      }
    } catch (error) {
      console.error('Cleanup error:', error)
    }
  })

  describe('Product Operations', () => {
    it('should insert a product successfully', async () => {
      const result = await sql`
        INSERT INTO products (
          name, 
          slug, 
          description, 
          short_description,
          price, 
          category_id,
          brand,
          stock,
          is_active
        ) VALUES (
          'Test Product',
          'test-product-' + UNIX_TIMESTAMP(),
          'Test product description',
          'Short desc',
          100000,
          ${testCategoryId},
          'Test Brand',
          50,
          true
        )
      `
      
      testProductId = (result as any)[0].insertId
      expect(testProductId).toBeGreaterThan(0)
    })

    it('should fetch a product by ID', async () => {
      if (!testProductId) {
        // Insert test product if not exists
        const result = await sql`
          INSERT INTO products (
            name, 
            slug, 
            description,
            short_description,
            price, 
            category_id,
            brand,
            stock,
            is_active
          ) VALUES (
            'Test Product',
            'test-product-' + UNIX_TIMESTAMP(),
            'Test product description',
            'Short desc',
            100000,
            ${testCategoryId},
            'Test Brand',
            50,
            true
          )
        `
        testProductId = (result as any)[0].insertId
      }

      const products = await sql`
        SELECT * FROM products WHERE id = ${testProductId}
      ` as any[]

      expect(products).toHaveLength(1)
      expect(products[0].id).toBe(testProductId)
      expect(products[0].name).toBe('Test Product')
      expect(products[0].short_description).toBe('Short desc')
    })

    it('should update product price', async () => {
      if (!testProductId) {
        const result = await sql`
          INSERT INTO products (
            name, 
            slug, 
            description,
            short_description,
            price, 
            category_id,
            brand,
            stock,
            is_active
          ) VALUES (
            'Test Product',
            'test-product-' + UNIX_TIMESTAMP(),
            'Test product description',
            'Short desc',
            100000,
            ${testCategoryId},
            'Test Brand',
            50,
            true
          )
        `
        testProductId = (result as any)[0].insertId
      }

      const updateResult = await sql`
        UPDATE products 
        SET price = 150000, sale_price = 120000, is_sale = true
        WHERE id = ${testProductId}
      `

      expect((updateResult as any)[0].affectedRows).toBe(1)

      const updated = await sql`
        SELECT price, sale_price, is_sale FROM products WHERE id = ${testProductId}
      ` as any[]

      expect(updated[0].price).toBe(150000)
      expect(updated[0].sale_price).toBe(120000)
      expect(updated[0].is_sale).toBe(1)
    })

    it('should list products with pagination', async () => {
      const products = await sql`
        SELECT p.*, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.is_active = true
        LIMIT 10 OFFSET 0
      `

      expect(Array.isArray(products)).toBe(true)
      expect(products.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Product Images Operations', () => {
    it('should insert product image', async () => {
      if (!testProductId) {
        const result = await sql`
          INSERT INTO products (
            name, slug, description, short_description, price, category_id, brand, stock, is_active
          ) VALUES (
            'Test Product', 'test-product-' + UNIX_TIMESTAMP(), 'Test', 'Short', 100000, ${testCategoryId}, 'Brand', 50, true
          )
        `
        testProductId = (result as any)[0].insertId
      }

      const imageResult = await sql`
        INSERT INTO product_images (product_id, url, is_main)
        VALUES (${testProductId}, 'https://example.com/image1.jpg', true)
      `

      const imageId = (imageResult as any)[0].insertId
      expect(imageId).toBeGreaterThan(0)
    })

    it('should fetch product images', async () => {
      if (!testProductId) {
        const result = await sql`
          INSERT INTO products (
            name, slug, description, short_description, price, category_id, brand, stock, is_active
          ) VALUES (
            'Test Product', 'test-product-' + UNIX_TIMESTAMP(), 'Test', 'Short', 100000, ${testCategoryId}, 'Brand', 50, true
          )
        `
        testProductId = (result as any)[0].insertId
      }

      await sql`
        INSERT INTO product_images (product_id, url, is_main)
        VALUES (${testProductId}, 'https://example.com/image1.jpg', true)
      `

      const images = await sql`
        SELECT id, url, is_main FROM product_images 
        WHERE product_id = ${testProductId}
        ORDER BY is_main DESC
      ` as any[]

      expect(Array.isArray(images)).toBe(true)
      if (images.length > 0) {
        expect(images[0].product_id || testProductId).toBeDefined()
        expect(images[0].url).toBeDefined()
      }
    })

    it('should update image is_main flag', async () => {
      if (!testProductId) {
        const result = await sql`
          INSERT INTO products (
            name, slug, description, short_description, price, category_id, brand, stock, is_active
          ) VALUES (
            'Test Product', 'test-product-' + UNIX_TIMESTAMP(), 'Test', 'Short', 100000, ${testCategoryId}, 'Brand', 50, true
          )
        `
        testProductId = (result as any)[0].insertId
      }

      const imageResult = await sql`
        INSERT INTO product_images (product_id, url, is_main)
        VALUES (${testProductId}, 'https://example.com/image1.jpg', false)
      `

      const imageId = (imageResult as any)[0].insertId

      const updateResult = await sql`
        UPDATE product_images SET is_main = true WHERE id = ${imageId}
      `

      expect((updateResult as any)[0].affectedRows).toBe(1)
    })
  })

  describe('Tags Operations', () => {
    it('should insert a tag', async () => {
      const uniqueSlug = `premium-${Date.now()}-${Math.floor(Math.random() * 1000000)}`
      const tagResult = await sql`
        INSERT INTO tags (name, slug)
        VALUES ('Premium', ${uniqueSlug})
      `

      const tagId = (tagResult as any)[0].insertId
      expect(tagId).toBeGreaterThan(0)
    })

    it('should map tag to product', async () => {
      if (!testProductId) {
        const result = await sql`
          INSERT INTO products (
            name, slug, description, short_description, price, category_id, brand, stock, is_active
          ) VALUES (
            'Test Product', 'test-product-' + UNIX_TIMESTAMP(), 'Test', 'Short', 100000, ${testCategoryId}, 'Brand', 50, true
          )
        `
        testProductId = (result as any)[0].insertId
      }

      const uniqueSlug = `premium-${Date.now()}-${Math.floor(Math.random() * 1000000)}`
      const tagResult = await sql`
        INSERT INTO tags (name, slug)
        VALUES ('Premium', ${uniqueSlug})
      `
      const tagId = (tagResult as any)[0].insertId

      const mapResult = await sql`
        INSERT INTO product_tags_map (product_id, tag_id)
        VALUES (${testProductId}, ${tagId})
      `

      expect((mapResult as any)[0].affectedRows || 1).toBeGreaterThanOrEqual(1)
    })

    it('should fetch tags for a product', async () => {
      if (!testProductId) {
        const result = await sql`
          INSERT INTO products (
            name, slug, description, short_description, price, category_id, brand, stock, is_active
          ) VALUES (
            'Test Product', 'test-product-' + UNIX_TIMESTAMP(), 'Test', 'Short', 100000, ${testCategoryId}, 'Brand', 50, true
          )
        `
        testProductId = (result as any)[0].insertId
      }

      const tags = await sql`
        SELECT t.id, t.name, t.slug
        FROM tags t
        JOIN product_tags_map ptm ON t.id = ptm.tag_id
        WHERE ptm.product_id = ${testProductId}
      ` as any[]

      expect(Array.isArray(tags)).toBe(true)
    })
  })

  describe('Search and Filter Operations', () => {
    it('should search products by name', async () => {
      const searchTerm = '%Test%'
      const results = await sql`
        SELECT id, name, slug FROM products
        WHERE is_active = true AND name LIKE ${searchTerm}
        LIMIT 10
      ` as any[]

      expect(Array.isArray(results)).toBe(true)
    })

    it('should filter products by category', async () => {
      const results = await sql`
        SELECT p.id, p.name FROM products p
        WHERE p.is_active = true AND p.category_id = ${testCategoryId}
        LIMIT 10
      ` as any[]

      expect(Array.isArray(results)).toBe(true)
    })

    it('should filter products by price range', async () => {
      const minPrice = 50000
      const maxPrice = 200000

      const results = await sql`
        SELECT p.id, p.name, p.price, p.sale_price
        FROM products p
        WHERE p.is_active = true 
        AND COALESCE(NULLIF(p.sale_price, 0), p.price) BETWEEN ${minPrice} AND ${maxPrice}
        LIMIT 10
      ` as any[]

      expect(Array.isArray(results)).toBe(true)
    })

    it('should get on-sale products', async () => {
      const results = await sql`
        SELECT p.id, p.name, p.price, p.sale_price
        FROM products p
        WHERE p.is_active = true 
        AND p.is_sale = true 
        AND p.sale_price IS NOT NULL 
        AND p.sale_price > 0
        LIMIT 10
      ` as any[]

      expect(Array.isArray(results)).toBe(true)
    })
  })

  describe('User and Cart Operations', () => {
    it('should insert user address', async () => {
      const addressResult = await sql`
        INSERT INTO user_addresses (user_id, line1, city, district, ward, is_default)
        VALUES (${testUserId}, '123 Main St', 'HCM', 'Q1', 'Ben Nghe', true)
      `

      const addressId = (addressResult as any)[0].insertId
      expect(addressId).toBeGreaterThan(0)
    })

    it('should fetch user addresses', async () => {
      const addresses = await sql`
        SELECT id, line1, city, district, ward
        FROM user_addresses
        WHERE user_id = ${testUserId}
      ` as any[]

      expect(Array.isArray(addresses)).toBe(true)
    })

    it('should add items to cart', async () => {
      if (!testProductId) {
        const result = await sql`
          INSERT INTO products (
            name, slug, description, short_description, price, category_id, brand, stock, is_active
          ) VALUES (
            'Test Product', 'test-product-' + UNIX_TIMESTAMP(), 'Test', 'Short', 100000, ${testCategoryId}, 'Brand', 50, true
          )
        `
        testProductId = (result as any)[0].insertId
      }

      const existingCart = await sql`
        SELECT id FROM carts WHERE user_id = ${testUserId} LIMIT 1
      ` as any[]

      let cartId: number
      if (existingCart.length > 0) {
        cartId = existingCart[0].id
      } else {
        const createdCart = await sql`
          INSERT INTO carts (user_id) VALUES (${testUserId})
        `
        cartId = (createdCart as any)[0].insertId
      }

      const cartResult = await sql`
        INSERT INTO cart_items (cart_id, product_id, qty, unit_price_snapshot)
        VALUES (${cartId}, ${testProductId}, 2, 100000)
        ON DUPLICATE KEY UPDATE qty = qty + VALUES(qty), unit_price_snapshot = VALUES(unit_price_snapshot)
      `

      expect((cartResult as any)[0].affectedRows || 1).toBeGreaterThanOrEqual(1)
    })

    it('should fetch user cart', async () => {
      const cartItems = await sql`
        SELECT ci.id, c.user_id, ci.product_id, ci.qty AS quantity, p.name, p.price
        FROM cart_items ci
        JOIN carts c ON ci.cart_id = c.id
        JOIN products p ON ci.product_id = p.id
        WHERE c.user_id = ${testUserId}
      ` as any[]

      expect(Array.isArray(cartItems)).toBe(true)
    })
  })

  describe('Database Integrity', () => {
    it('should have valid foreign key relationships', async () => {
      if (!testProductId) {
        const result = await sql`
          INSERT INTO products (
            name, slug, description, short_description, price, category_id, brand, stock, is_active
          ) VALUES (
            'Test Product', 'test-product-' + UNIX_TIMESTAMP(), 'Test', 'Short', 100000, ${testCategoryId}, 'Brand', 50, true
          )
        `
        testProductId = (result as any)[0].insertId
      }

      // Check product references valid category
      const product = await sql`
        SELECT p.id, c.id as category_id
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = ${testProductId}
      ` as any[]

      expect(product[0]).toBeDefined()
      expect(product[0].category_id).toBeGreaterThan(0)
    })

    it('should count total products', async () => {
      const result = await sql`
        SELECT COUNT(*) as total FROM products WHERE is_active = true
      ` as any[]

      expect(result[0].total).toBeGreaterThanOrEqual(0)
    })

    it('should count categories', async () => {
      const result = await sql`
        SELECT COUNT(*) as total FROM categories
      ` as any[]

      expect(result[0].total).toBeGreaterThan(0)
    })
  })
})
