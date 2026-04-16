'use client'

import { useState, useEffect } from 'react'
import { formatPrice } from '@/lib/price-utils'
import toast from 'react-hot-toast'

interface Order {
  id: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  subtotal: number
  shippingFee: number
  total: number
  placedAt: string
  paidAt: string | null
  shippedAt: string | null
  deliveredAt: string | null
  cancelledAt: string | null
  paymentProofUrl: string | null
  shippingProvider: string | null
  trackingNumber: string | null
  user: {
    id: number
    name: string
    email: string
  }
  items: {
    id: number
    qty: number
    unitPrice: number
    total: number
    product: {
      id: number
      name: string
    }
  }[]
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [allOrders, setAllOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')

  const [revenueStats, setRevenueStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    yearlyRevenue: 0,
  })

  useEffect(() => {
    fetchOrders()
    fetchRevenueStats()
  }, [statusFilter])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/orders')
      const result = await response.json()
      
      if (result.success) {
        const transformedOrders = result.data.map((order: any) => ({
          id: order.id,
          status: order.status,
          subtotal: order.subtotal,
          shippingFee: order.shipping_fee,
          total: order.total,
          placedAt: order.placed_at,
          paidAt: order.paid_at,
          shippedAt: order.shipped_at,
          deliveredAt: order.delivered_at,
          cancelledAt: order.cancelled_at,
          paymentProofUrl: order.payment_proof_url,
          shippingProvider: order.shipping_provider,
          trackingNumber: order.tracking_number,
          user: order.user,
          items: order.items
        }))
        
        setAllOrders(transformedOrders)
        
        const filteredOrders = statusFilter === 'all' 
          ? transformedOrders 
          : transformedOrders.filter((order: any) => order.status === statusFilter)
        
        setOrders(filteredOrders)
      } else {
        setOrders([])
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: number, action: string, data?: any) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, ...data })
      })

      const result = await response.json()
      
      if (result.success) {
        fetchOrders()
        fetchRevenueStats()
        toast.success('Cập nhật đơn hàng thành công!')
      } else {
        toast.error('Lỗi: ' + (result.error || 'Không thể cập nhật'))
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi kết nối máy chủ')
    }
  }

  const fetchRevenueStats = async () => {
    try {
      const response = await fetch('/api/admin/revenue')
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setRevenueStats(result.data)
        }
      }
    } catch (error) {
      console.error('Error fetching revenue stats:', error)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Chưa cập nhật'
    return new Date(dateString).toLocaleString('vi-VN')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'shipped': return 'bg-purple-100 text-purple-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xác nhận'
      case 'confirmed': return 'Đã xác nhận'
      case 'shipped': return 'Đang giao hàng'
      case 'delivered': return 'Đã hoàn thành'
      case 'cancelled': return 'Đã hủy'
      default: return status
    }
  }

  const getOrderStats = () => {
    const pending = allOrders.filter(order => order.status === 'pending').length
    const confirmed = allOrders.filter(order => order.status === 'confirmed').length
    const shipped = allOrders.filter(order => order.status === 'shipped').length
    const delivered = allOrders.filter(order => order.status === 'delivered').length
    return { pending, confirmed, shipped, delivered }
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý đơn hàng</h1>
        <p className="text-gray-600">Theo dõi quy trình xử lý đơn hàng từ lúc đặt đến khi hoàn tất.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {(() => {
          const stats = getOrderStats()
          return (
            <>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-yellow-100">
                <p className="text-xs font-medium text-gray-500 uppercase">Chờ xác nhận</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                <p className="text-xs font-medium text-gray-500 uppercase">Đã xác nhận</p>
                <p className="text-2xl font-bold text-blue-600">{stats.confirmed}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-purple-100">
                <p className="text-xs font-medium text-gray-500 uppercase">Đang vận chuyển</p>
                <p className="text-2xl font-bold text-purple-600">{stats.shipped}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                <p className="text-xs font-medium text-gray-500 uppercase">Thành công</p>
                <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
              </div>
            </>
          )
        })()}
      </div>

      {/* Filters & Revenue Summary */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-sm border flex-1">
          <div className="flex items-center gap-4">
            <label className="text-sm font-bold text-gray-700">Trạng thái:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#6a9739] outline-none"
            >
              <option value="all">Tất cả đơn hàng</option>
              <option value="pending">Chờ xác nhận</option>
              <option value="confirmed">Đã xác nhận/thanh toán</option>
              <option value="shipped">Đang giao hàng</option>
              <option value="delivered">Đã hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
        </div>
        <div className="bg-[#6a9739] text-white p-4 rounded-lg shadow-md flex gap-8 items-center px-8">
           <div>
              <p className="text-xs opacity-80 uppercase font-medium">Doanh thu tháng này</p>
              <p className="text-xl font-bold">{formatPrice(revenueStats.monthlyRevenue)}</p>
           </div>
           <div className="w-px h-10 bg-white/20 hidden md:block"></div>
           <div>
              <p className="text-xs opacity-80 uppercase font-medium">Tổng doanh thu</p>
              <p className="text-xl font-bold">{formatPrice(revenueStats.totalRevenue)}</p>
           </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Mã đơn</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Khách hàng</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Trạng thái</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Tổng tiền</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">#{order.id}</div>
                    <div className="text-[10px] text-gray-400 uppercase">{formatDate(order.placedAt)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{order.user.name}</div>
                    <div className="text-xs text-gray-500">{order.user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#6a9739]">
                    {formatPrice(order.total)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-medium">
                    <div className="flex gap-2">
                      {/* XÁC NHẬN THANH TOÁN (Nếu đang pending) */}
                      {order.status === 'pending' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'pay')}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded shadow-sm hover:bg-blue-700"
                        >
                          Xác nhận thanh toán
                        </button>
                      )}

                      {/* GIAO HÀNG (Nếu đã confirmed hoặc đã paid) */}
                      {(order.status === 'confirmed') && (
                        <button
                          onClick={() => {
                            const providers = ['Viettel Post', 'GHN', 'J&T Express']
                            const randomProvider = providers[Math.floor(Math.random() * providers.length)]
                            const randomTracking = 'VN' + Math.random().toString(36).substr(2, 9).toUpperCase()
                            updateOrderStatus(order.id, 'ship', { 
                              shippingProvider: randomProvider, 
                              trackingNumber: randomTracking 
                            })
                          }}
                          className="px-3 py-1.5 bg-purple-600 text-white rounded shadow-sm hover:bg-purple-700"
                        >
                          Giao hàng
                        </button>
                      )}

                      {/* HOÀN THÀNH (Nếu đang ship) */}
                      {order.status === 'shipped' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'deliver')}
                          className="px-3 py-1.5 bg-green-600 text-white rounded shadow-sm hover:bg-green-700"
                        >
                          Hoàn thành
                        </button>
                      )}

                      {/* HỦY ĐƠN (Nếu chưa thành công/hủy) */}
                      {order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <button
                          onClick={() => {
                            if (confirm('Bạn có chắc muốn hủy đơn hàng này?')) {
                              updateOrderStatus(order.id, 'cancel')
                            }
                          }}
                          className="px-3 py-1.5 bg-white border border-red-200 text-red-600 rounded hover:bg-red-50"
                        >
                          Hủy
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && !loading && (
            <div className="p-10 text-center text-gray-500">
               Không tìm thấy đơn hàng nào ở trạng thái này.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}