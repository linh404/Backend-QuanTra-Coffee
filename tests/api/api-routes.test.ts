import { describe, it, expect, beforeEach, vi } from 'vitest'
import bcrypt from 'bcryptjs'

// Use vi.hoisted to create mocks that don't get hoisted
const { sqlTagMock, sqlQueryMock, getUserIdFromTokenMock, getUserFromTokenMock } = vi.hoisted(() => {
  return {
    sqlTagMock: vi.fn(),
    sqlQueryMock: vi.fn(),
    getUserIdFromTokenMock: vi.fn(),
    getUserFromTokenMock: vi.fn(),
  }
})

vi.mock('@/lib/db', () => {
  return {
    sql: Object.assign(sqlTagMock, {
      query: sqlQueryMock,
      fragment: vi.fn(),
      pool: {},
    }),
  }
})

vi.mock('@/lib/auth-utils', () => {
  return {
    getUserIdFromToken: getUserIdFromTokenMock,
    getUserFromToken: getUserFromTokenMock,
  }
})

// Import AFTER mocking
import { POST as loginPost } from '@/app/api/auth/login/route'
import { GET as productsGet } from '@/app/api/products/route'
import { GET as cartGet } from '@/app/api/cart/route'
import { GET as adminProductsGet } from '@/app/api/admin/products/route'
import { POST as meAddressesPost } from '@/app/api/me/addresses/route'

function queryText(strings: unknown): string {
  if (!Array.isArray(strings)) {
    return ''
  }

  return strings.map((part) => String(part)).join(' ')
}

describe('backend-mysql API routes', () => {
  beforeEach(() => {
    sqlTagMock.mockReset()
    sqlQueryMock.mockReset()
    getUserIdFromTokenMock.mockReset()
    getUserFromTokenMock.mockReset()
  })

  it('POST /api/auth/login should login successfully with valid credentials', async () => {
    const passwordHash = await bcrypt.hash('secret123', 8)

    sqlTagMock.mockResolvedValueOnce([
      {
        id: 1,
        email: 'buyer@example.com',
        password_hash: passwordHash,
        name: 'Buyer',
        role: 'buyer',
      },
    ])

    const req = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'buyer@example.com', password: 'secret123' }),
      headers: { 'content-type': 'application/json' },
    })

    const res = await loginPost(req as never)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.user.email).toBe('buyer@example.com')
    expect(typeof body.data.token).toBe('string')
    expect(res.headers.get('set-cookie')).toContain('token=')
  })

  it('POST /api/auth/login should return 401 for invalid credentials', async () => {
    sqlTagMock.mockResolvedValueOnce([])

    const req = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'unknown@example.com', password: 'bad' }),
      headers: { 'content-type': 'application/json' },
    })

    const res = await loginPost(req as never)
    const body = await res.json()

    expect(res.status).toBe(401)
    expect(body.success).toBe(false)
    expect(body.error).toBe('Invalid credentials')
  })

  it('GET /api/products should return mapped products and pagination', async () => {
    sqlTagMock.mockImplementation((strings: unknown) => {
      const text = queryText(strings)

      if (text.includes('SELECT p.*, c.name as category_name, c.slug as category_slug')) {
        return Promise.resolve([
          {
            id: 10,
            name: 'Ca phe Arabica',
            slug: 'ca-phe-arabica',
            brand: 'Green Farm',
            description: 'Loai hat chat luong cao',
            price: 120000,
            sale_price: 99000,
            is_sale: 1,
            stock: 12,
            image_url: 'https://example.com/a.jpg',
            category_id: 2,
            category_name: 'Ca phe hat',
            category_slug: 'ca-phe-hat',
          },
        ])
      }

      if (text.includes('SELECT COUNT(*) as total')) {
        return Promise.resolve([{ total: 1 }])
      }

      return Promise.resolve([])
    })

    const req = new Request('http://localhost:3000/api/products?page=1&limit=10&q=ca%20phe')
    const res = await productsGet(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data).toHaveLength(1)
    expect(body.data[0].images).toEqual([])
    expect(body.pagination.total).toBe(1)
    expect(body.pagination.totalPages).toBe(1)
  })

  it('GET /api/cart should return 401 when user is not authenticated', async () => {
    getUserIdFromTokenMock.mockReturnValue(null)

    const req = new Request('http://localhost:3000/api/cart')
    const res = await cartGet(req as never)
    const body = await res.json()

    expect(res.status).toBe(401)
    expect(body.success).toBe(false)
    expect(body.error).toBe('Authentication required')
  })

  it('GET /api/admin/products should return 403 for non-admin user', async () => {
    getUserFromTokenMock.mockReturnValue({
      userId: '7',
      email: 'buyer@example.com',
      role: 'buyer',
    })

    const req = new Request('http://localhost:3000/api/admin/products')
    const res = await adminProductsGet(req as never)
    const body = await res.json()

    expect(res.status).toBe(403)
    expect(body.success).toBe(false)
    expect(body.error).toBe('Admin access required')
  })

  it('POST /api/me/addresses should create and return latest address', async () => {
    getUserIdFromTokenMock.mockReturnValue('3')

    sqlTagMock.mockImplementation((strings: unknown) => {
      const text = queryText(strings)

      if (text.includes('INSERT INTO user_addresses')) {
        return Promise.resolve([])
      }

      if (text.includes('SELECT *') && text.includes('FROM user_addresses')) {
        return Promise.resolve([
          {
            id: 101,
            user_id: 3,
            line1: '12 Nguyen Hue',
            city: 'HCM',
            district: 'Quan 1',
            ward: 'Ben Nghe',
            is_default: 1,
          },
        ])
      }

      return Promise.resolve([])
    })

    const req = new Request('http://localhost:3000/api/me/addresses', {
      method: 'POST',
      body: JSON.stringify({
        line1: '12 Nguyen Hue',
        city: 'HCM',
        district: 'Quan 1',
        ward: 'Ben Nghe',
        isDefault: true,
      }),
      headers: { 'content-type': 'application/json' },
    })

    const res = await meAddressesPost(req as never)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.id).toBe(101)
    expect(body.data.line1).toBe('12 Nguyen Hue')
  })
})
