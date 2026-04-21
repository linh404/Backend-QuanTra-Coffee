import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getUserFromToken } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromToken(request)
    
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

    // Get current date for calculations
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth() + 1 // SQL months are 1-based

    // Calculate total revenue (all delivered orders)
    const totalRevenueResult = await sql`
      SELECT COALESCE(SUM(total), 0) as total_revenue
      FROM orders 
      WHERE status = 'delivered'
    `

    // Calculate monthly revenue (current month, delivered orders)
    const monthlyRevenueResult = await sql`
      SELECT COALESCE(SUM(total), 0) as monthly_revenue
      FROM orders 
      WHERE status = 'delivered'
        AND YEAR(delivered_at) = ${currentYear}
        AND MONTH(delivered_at) = ${currentMonth}
    `

    // Calculate yearly revenue (current year, delivered orders)
    const yearlyRevenueResult = await sql`
      SELECT COALESCE(SUM(total), 0) as yearly_revenue
      FROM orders 
      WHERE status = 'delivered'
        AND YEAR(delivered_at) = ${currentYear}
    `

    // Get additional stats for context
    const orderStatsResult = await sql`
      SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_orders,
        COUNT(CASE WHEN status = 'shipped' THEN 1 END) as shipped_orders,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders
      FROM orders
    `

    // Get monthly breakdown for chart (last 12 months)
    const monthlyBreakdownResult = await sql`
      SELECT 
        YEAR(delivered_at) as year,
        MONTH(delivered_at) as month,
        COALESCE(SUM(total), 0) as revenue,
        COUNT(*) as order_count
      FROM orders 
      WHERE status = 'delivered'
        AND delivered_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY YEAR(delivered_at), MONTH(delivered_at)
      ORDER BY year DESC, month DESC
    `

    const revenueStats = {
      totalRevenue: parseFloat(totalRevenueResult[0]?.total_revenue || '0'),
      monthlyRevenue: parseFloat(monthlyRevenueResult[0]?.monthly_revenue || '0'),
      yearlyRevenue: parseFloat(yearlyRevenueResult[0]?.yearly_revenue || '0'),
      orderStats: {
        totalOrders: parseInt(orderStatsResult[0]?.total_orders || '0'),
        deliveredOrders: parseInt(orderStatsResult[0]?.delivered_orders || '0'),
        pendingOrders: parseInt(orderStatsResult[0]?.pending_orders || '0'),
        paidOrders: parseInt(orderStatsResult[0]?.paid_orders || '0'),
        shippedOrders: parseInt(orderStatsResult[0]?.shipped_orders || '0'),
        cancelledOrders: parseInt(orderStatsResult[0]?.cancelled_orders || '0')
      },
      monthlyBreakdown: monthlyBreakdownResult.map(row => ({
        year: parseInt(row.year),
        month: parseInt(row.month),
        revenue: parseFloat(row.revenue),
        orderCount: parseInt(row.order_count)
      }))
    }

    return NextResponse.json({
      success: true,
      data: revenueStats
    })
  } catch (error) {
    console.error('Error fetching revenue stats:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch revenue statistics' 
      },
      { status: 500 }
    )
  }
}
