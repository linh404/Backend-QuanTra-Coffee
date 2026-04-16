'use client'

import { useState, useEffect } from 'react'
import { formatPrice } from '@/lib/price-utils'
import toast from 'react-hot-toast'
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Shield, 
  Edit3, 
  Eye, 
  X, 
  Save, 
  Search,
  CheckCircle,
  Ban
} from 'lucide-react'

interface User {
  id: number
  name: string
  email: string
  phone: string
  role: 'buyer' | 'admin'
  status: 'active' | 'inactive' | 'banned'
  totalOrders: number
  totalSpent: number
  joinedAt: string
  lastLoginAt: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Modal State
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [updateLoading, setUpdateLoading] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [statusFilter, roleFilter])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const result = await response.json()
      
      if (result.success) {
        const transformedUsers = result.data.map((user: any) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone || 'N/A',
          role: user.role,
          status: user.status,
          totalOrders: user.total_orders || 0,
          totalSpent: user.total_spent || 0,
          joinedAt: user.created_at,
          lastLoginAt: user.last_login_at || user.created_at
        }))

        let filtered = transformedUsers
        if (statusFilter !== 'all') filtered = filtered.filter((u: User) => u.status === statusFilter)
        if (roleFilter !== 'all') filtered = filtered.filter((u: User) => u.role === roleFilter)
        
        setUsers(filtered)
      }
    } catch (error) {
      toast.error('Không thể tải danh sách người dùng')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return

    setUpdateLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          name: selectedUser.name,
          role: selectedUser.role,
          status: selectedUser.status,
          phone: selectedUser.phone
        })
      })
      const result = await response.json()
      if (result.success) {
        toast.success('Cập nhật người dùng thành công')
        setIsEditModalOpen(false)
        fetchUsers()
      } else {
        toast.error(result.error || 'Cập nhật thất bại')
      }
    } catch (error) {
      toast.error('Lỗi kết nối máy chủ')
    } finally {
      setUpdateLoading(false)
    }
  }

  const filteredAndSearchedUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Helpers for UI
  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-700 border-green-200',
      inactive: 'bg-gray-100 text-gray-700 border-gray-200',
      banned: 'bg-red-100 text-red-700 border-red-200',
    }[status] || 'bg-gray-100 text-gray-700'
    return <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${styles}`}>{status}</span>
  }

  return (
    <div className="min-h-screen bg-[#f8faf7] p-4 md:p-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            Quản Lý <span className="text-lime-600">Người Dùng</span>
          </h1>
          <p className="text-gray-500 font-medium mt-1">Phân quyền và kiểm soát tài khoản trong hệ thống Green Store.</p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
        <div className="lg:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Tìm theo tên hoặc email..." 
            className="w-full pl-10 pr-4 py-3 rounded-2xl border-none bg-white shadow-sm focus:ring-2 focus:ring-lime-500 transition-all outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 rounded-2xl border-none bg-white shadow-sm focus:ring-2 focus:ring-lime-500 outline-none font-bold text-gray-600"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Hoạt động</option>
          <option value="inactive">Ngoại tuyến</option>
          <option value="banned">Đã khóa</option>
        </select>
        <select 
          value={roleFilter} 
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-3 rounded-2xl border-none bg-white shadow-sm focus:ring-2 focus:ring-lime-500 outline-none font-bold text-gray-600"
        >
          <option value="all">Tất cả quyền hạn</option>
          <option value="admin">Quản trị viên</option>
          <option value="buyer">Khách hàng</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="px-8 py-5">Người dùng</th>
                <th className="px-8 py-5">Quyền hạn</th>
                <th className="px-8 py-5">Trạng thái</th>
                <th className="px-8 py-5">Thống kê</th>
                <th className="px-8 py-5 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredAndSearchedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-lime-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-lime-100 rounded-xl flex items-center justify-center text-lime-600 font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-black text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase ${user.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                      <Shield className="w-3 h-3" /> {user.role}
                    </span>
                  </td>
                  <td className="px-8 py-6">{getStatusBadge(user.status)}</td>
                  <td className="px-8 py-6">
                    <div className="text-[10px] font-bold text-gray-400">Đơn hàng: <span className="text-gray-900">{user.totalOrders}</span></div>
                    <div className="text-[10px] font-bold text-gray-400">Chi tiêu: <span className="text-lime-600">{formatPrice(user.totalSpent)}</span></div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => { setSelectedUser(user); setIsViewModalOpen(true); }}
                        className="p-2 bg-gray-50 text-gray-400 hover:text-lime-600 hover:bg-lime-50 rounded-xl transition"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => { setSelectedUser(user); setIsEditModalOpen(true); }}
                        className="p-2 bg-lime-600 text-white hover:bg-lime-700 rounded-xl transition shadow-lg shadow-lime-200"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden p-8 animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Chỉnh sửa người dùng</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition"><X /></button>
            </div>
            <form onSubmit={handleUpdateUser} className="space-y-5">
              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Họ và tên</label>
                <input 
                  type="text" 
                  value={selectedUser.name} 
                  onChange={(e) => setSelectedUser({...selectedUser, name: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-lime-500 font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Quyền hạn</label>
                  <select 
                    value={selectedUser.role} 
                    onChange={(e) => setSelectedUser({...selectedUser, role: e.target.value as any})}
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl font-bold"
                  >
                    <option value="buyer">Người dùng</option>
                    <option value="admin">Quản trị viên</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Trạng thái</label>
                  <select 
                    value={selectedUser.status} 
                    onChange={(e) => setSelectedUser({...selectedUser, status: e.target.value as any})}
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl font-bold"
                  >
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Ngoại tuyến</option>
                    <option value="banned">Đã khóa</option>
                  </select>
                </div>
              </div>
              <button 
                type="submit" 
                disabled={updateLoading}
                className="w-full py-4 bg-lime-600 hover:bg-lime-700 text-white font-black rounded-2xl shadow-xl shadow-lime-200 transition-all flex items-center justify-center gap-2"
              >
                {updateLoading ? 'ĐANG LƯU...' : <><Save className="w-5 h-5" /> LƯU THÔNG TIN</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {isViewModalOpen && selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
            <div className="bg-lime-900 p-8 text-white relative">
               <div className="relative z-10 flex items-center gap-6">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-3xl font-black">
                    {selectedUser.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black">{selectedUser.name}</h3>
                    <p className="opacity-70 text-sm font-bold uppercase tracking-widest">#{selectedUser.id}</p>
                  </div>
               </div>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Mail className="w-3 h-3"/> Email</p>
                  <p className="text-sm font-bold text-gray-700">{selectedUser.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Phone className="w-3 h-3"/> Điện thoại</p>
                  <p className="text-sm font-bold text-gray-700">{selectedUser.phone}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Shield className="w-3 h-3"/> Tham gia</p>
                  <p className="text-sm font-bold text-gray-700">{new Date(selectedUser.joinedAt).toLocaleDateString('vi-VN')}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><UserIcon className="w-3 h-3"/> Truy cập cuối</p>
                  <p className="text-sm font-bold text-gray-700">{new Date(selectedUser.lastLoginAt).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>
              <div className="pt-6 border-t border-gray-50 flex justify-between">
                <div className="text-center bg-gray-50 p-4 rounded-2xl flex-1 mr-2">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Đơn hàng</p>
                  <p className="text-xl font-black text-gray-900">{selectedUser.totalOrders}</p>
                </div>
                <div className="text-center bg-lime-50 p-4 rounded-2xl flex-1 ml-2">
                  <p className="text-xs font-black text-lime-400 uppercase tracking-widest">Chi tiêu</p>
                  <p className="text-xl font-black text-lime-700">{formatPrice(selectedUser.totalSpent)}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsViewModalOpen(false)}
                className="w-full py-4 bg-gray-900 text-white font-black rounded-2xl shadow-lg transition-transform active:scale-95"
              >
                ĐÓNG CỬA SỔ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}