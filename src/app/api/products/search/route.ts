import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sql } from '@/lib/db';

export const runtime = 'nodejs';

const QuerySchema = z.object({
  q: z.string().optional(),
  category_id: z.string().optional(),
  category_name: z.string().optional(),
  price_min: z.coerce.number().optional(),
  price_max: z.coerce.number().optional(),
  in_stock_only: z.coerce.boolean().optional(),
  sort: z.string().optional(),
  page: z.coerce.number().optional(),
});

type SearchProductRow = {
  id: number;
  name: string;
  slug: string;
  brand: string | null;
  description: string | null;
  price: number;
  sale_price: number | null;
  is_sale: boolean | null;
  stock: number | null;
  image_url: string | null;
  category_id: number | null;
  category_name: string | null;
  category_slug: string | null;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const raw = Object.fromEntries(url.searchParams.entries());
  const parsed = QuerySchema.parse({
    ...raw,
    category_id: raw.category_id ?? raw.category,
    price_min: raw.price_min ?? raw.minPrice,
    price_max: raw.price_max ?? raw.maxPrice,
    sort: raw.sort ?? raw.sortBy,
  });

  const page = parsed.page || 1;
  const limit = Number(raw.pageSize) || 10;
  const offset = (page - 1) * limit;

  try {
    const rawSearch = parsed.q?.trim() || '';
    const searchTerm = rawSearch ? `%${rawSearch}%` : '';

    const sortClause = (() => {
      switch (parsed.sort) {
        case 'price_desc':
          return sql`ORDER BY p.price DESC, p.id DESC`;
        case 'price_asc':
          return sql`ORDER BY p.price ASC, p.id DESC`;
        case 'name_asc':
          return sql`ORDER BY p.name ASC, p.id DESC`;
        case 'name_desc':
          return sql`ORDER BY p.name DESC, p.id DESC`;
        case 'discount_desc':
          return sql`ORDER BY (p.price - COALESCE(p.sale_price, p.price)) DESC, p.id DESC`;
        case 'newest':
          return sql`ORDER BY p.created_at DESC, p.id DESC`;
        case 'random':
          return sql`ORDER BY RAND()`;
        case 'best_selling':
          return sql`ORDER BY COALESCE(sales.total_qty, 0) DESC, p.id DESC`;
        case 'top_rated':
          return sql`ORDER BY COALESCE(reviews.avg_rating, 0) DESC, p.id DESC`;
        default:
          return sql`ORDER BY p.id DESC`;
      }
    })();

    const searchClause = rawSearch
      ? sql`AND (LOWER(p.name) LIKE LOWER(${searchTerm}) OR LOWER(p.short_description) LIKE LOWER(${searchTerm}))`
      : sql``;

    const products = await sql`
      SELECT
        p.id,
        p.name,
        p.slug,
        p.brand,
        p.description,
        p.price,
        p.sale_price,
        p.is_sale,
        p.stock,
        p.image_url,
        p.category_id,
        c.name AS category_name,
        c.slug AS category_slug,
        COALESCE(sales.total_qty, 0) as total_sold,
        COALESCE(reviews.avg_rating, 0) as rating
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN (
        SELECT product_id, SUM(qty) as total_qty 
        FROM order_items 
        GROUP BY product_id
      ) sales ON sales.product_id = p.id
      LEFT JOIN (
        SELECT product_id, AVG(rating) as avg_rating 
        FROM product_reviews 
        GROUP BY product_id
      ) reviews ON reviews.product_id = p.id
      WHERE 1 = 1
      ${searchClause}
      ${parsed.category_id ? sql`AND p.category_id = ${Number(parsed.category_id)}` : sql``}
      ${parsed.category_name ? sql`AND (LOWER(c.name) LIKE LOWER(${`%${parsed.category_name}%`}) OR LOWER(c.slug) LIKE LOWER(${`%${parsed.category_name}%`}))` : sql``}
      ${parsed.price_min != null ? sql`AND p.price >= ${parsed.price_min}` : sql``}
      ${parsed.price_max != null ? sql`AND p.price <= ${parsed.price_max}` : sql``}
      ${parsed.in_stock_only ? sql`AND p.stock > 0` : sql``}
      ${sortClause}
      LIMIT ${limit} OFFSET ${offset}
    `;

    const countResult = await sql`
      SELECT COUNT(*) AS total
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE 1 = 1
      ${searchClause}
      ${parsed.category_id ? sql`AND p.category_id = ${Number(parsed.category_id)}` : sql``}
      ${parsed.category_name ? sql`AND (LOWER(c.name) LIKE LOWER(${`%${parsed.category_name}%`}) OR LOWER(c.slug) LIKE LOWER(${`%${parsed.category_name}%`}))` : sql``}
      ${parsed.price_min != null ? sql`AND p.price >= ${parsed.price_min}` : sql``}
      ${parsed.price_max != null ? sql`AND p.price <= ${parsed.price_max}` : sql``}
      ${parsed.in_stock_only ? sql`AND p.stock > 0` : sql``}
    `;

    const mappedProducts = (products as SearchProductRow[]).map((product) => ({
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
      category: product.category_id
        ? {
            id: product.category_id,
            name: product.category_name,
            slug: product.category_slug,
          }
        : null,
    }));

    const total = Number(countResult[0]?.total || 0);

    return NextResponse.json({
      success: true,
      data: mappedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('search error', err);
    return NextResponse.json({ success: false, error: 'search failed' }, { status: 500 });
  }
}
