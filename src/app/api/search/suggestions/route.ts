import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import {
  generateVietnameseSearchVariations,
  calculateVietnameseSimilarity
} from '@/lib/vietnamese-utils'

/* =========================
   TYPES
========================= */

interface Suggestion {
  name: string | null
  slug: string | null
  brand: string | null
  category_name: string | null
  type: 'product' | 'category' | 'brand'
}

type ScoredSuggestion = Suggestion & {
  relevanceScore: number
}

/* =========================
   API HANDLER
========================= */

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        success: true,
        data: []
      })
    }

    const searchTerm = query.trim()
    const variations = generateVietnameseSearchVariations(searchTerm)
    const searchVariations =
      variations.length > 0 ? variations : [searchTerm.toLowerCase()]

    /* =========================
       PRODUCT SUGGESTIONS
    ========================= */

    const productRaw = await sql`
      SELECT DISTINCT 
        p.name,
        p.slug,
        p.brand,
        c.name as category_name,
        'product' as type
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = true
      AND (
        ${searchVariations
          .map(v => sql`LOWER(p.name) LIKE ${`%${v}%`}`)
          .reduce((acc, curr) => sql`${acc} OR ${curr}`)}
      )
      ORDER BY p.name
      LIMIT ${limit}
    `

    const categoryRaw = await sql`
      SELECT DISTINCT 
        name,
        slug,
        NULL as brand,
        name as category_name,
        'category' as type
      FROM categories
      WHERE (
        ${searchVariations
          .map(v => sql`LOWER(name) LIKE ${`%${v}%`}`)
          .reduce((acc, curr) => sql`${acc} OR ${curr}`)}
      )
      ORDER BY name
      LIMIT 5
    `

    const brandRaw = await sql`
      SELECT DISTINCT 
        brand as name,
        NULL as slug,
        brand,
        NULL as category_name,
        'brand' as type
      FROM products
      WHERE is_active = true 
      AND brand IS NOT NULL
      AND (
        ${searchVariations
          .map(v => sql`LOWER(brand) LIKE ${`%${v}%`}`)
          .reduce((acc, curr) => sql`${acc} OR ${curr}`)}
      )
      ORDER BY brand
      LIMIT 5
    `

    /* =========================
       ÉP KIỂU SAU QUERY
    ========================= */

    const productSuggestions = productRaw as Suggestion[]
    const categorySuggestions = categoryRaw as Suggestion[]
    const brandSuggestions = brandRaw as Suggestion[]

    const allSuggestions = [
      ...productSuggestions,
      ...categorySuggestions,
      ...brandSuggestions
    ]

    /* =========================
       SCORE
    ========================= */

    const scoredSuggestions: ScoredSuggestion[] =
      allSuggestions.map((suggestion) => {
        const name = suggestion.name || ''

        return {
          ...suggestion,
          relevanceScore: calculateVietnameseSimilarity(
            searchTerm,
            name
          )
        }
      })

    /* =========================
       SORT + UNIQUE
    ========================= */

    const uniqueSuggestions = scoredSuggestions
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .filter(
        (suggestion, index, self) =>
          index ===
          self.findIndex(
            (s) =>
              s.name === suggestion.name &&
              s.type === suggestion.type
          )
      )
      .slice(0, limit)

    return NextResponse.json({
      success: true,
      data: uniqueSuggestions
    })

  } catch (error) {
    console.error('Error fetching search suggestions:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch search suggestions'
      },
      { status: 500 }
    )
  }
}