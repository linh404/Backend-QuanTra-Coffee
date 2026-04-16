'use client'

import { useState, Suspense } from 'react' // 1. Thêm Suspense vào import
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import toast from 'react-hot-toast'
import { User, Mail, Lock, MapPin, ArrowRight, Leaf } from 'lucide-react'

// 2. Tách nội dung form thành một component riêng
function RegisterContent() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'buyer',
    line1: '',
    city: '',
    district: '',
    ward: ''
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (formData.password !== formData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          line1: formData.line1,
          city: formData.city,
          district: formData.district,
          ward: formData.ward
        })
      })

      const data = await response.json()
      
      if (data.success) {
        login(data.data.user, data.data.token)
        toast.success('Đăng ký thành công! Chào mừng bạn.')
        data.data.user.role === 'admin' ? router.push('/admin/orders') : router.push('/')
      } else {
        toast.error(data.error || 'Đăng ký thất bại')
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi đăng ký')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const inputClass = "w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-lime-500 transition-all outline-none"

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8faf7] pt-28 pb-12 px-4 relative overflow-hidden">
      <Leaf className="absolute -top-10 -right-10 w-64 h-64 text-lime-100 rotate-12 pointer-events-none" />
      <Leaf className="absolute -bottom-10 -left-10 w-48 h-48 text-lime-50 -rotate-12 pointer-events-none" />

      <div className="max-w-xl w-full space-y-8 relative z-10">
        <div className="text-center">
          <div className="inline-flex p-4 bg-white rounded-3xl shadow-sm mb-4">
             <div className="flex items-center justify-center w-12 h-12 bg-lime-500 rounded-2xl text-white">
                <Leaf className="w-8 h-8" />
             </div>
          </div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">
            Khởi đầu <span className="text-lime-600">Sống Xanh</span>
          </h2>
          <p className="mt-3 text-gray-500 font-medium">
            Gia nhập cộng đồng Green Store ngay hôm nay
          </p>
        </div>
        
        <form className="mt-8 bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-lime-100/50 border border-gray-100" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input name="name" type="text" required value={formData.name} onChange={handleChange} className={inputClass} placeholder="Họ và tên" />
            </div>
            
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input name="email" type="email" required value={formData.email} onChange={handleChange} className={inputClass} placeholder="Email" />
            </div>

            <div className="md:col-span-2 relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input name="line1" type="text" value={formData.line1} onChange={handleChange} className={inputClass} placeholder="Số nhà, tên đường" />
            </div>

            <input name="ward" value={formData.ward} onChange={handleChange} className={inputClass} placeholder="Phường/Xã" />
            <input name="district" value={formData.district} onChange={handleChange} className={inputClass} placeholder="Quận/Huyện" />

            <div className="md:col-span-2">
              <input name="city" value={formData.city} onChange={handleChange} className={inputClass} placeholder="Tỉnh/Thành phố" />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input name="password" type="password" required value={formData.password} onChange={handleChange} className={inputClass} placeholder="Mật khẩu" />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input name="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleChange} className={inputClass} placeholder="Xác nhận mật khẩu" />
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-4 px-4 bg-lime-600 hover:bg-lime-700 text-white font-bold rounded-2xl shadow-lg shadow-lime-200 transition-all transform active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Đang tạo tài khoản...' : (
                <>
                  TẠO TÀI KHOẢN NGAY <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <p className="text-sm text-gray-500 font-medium">
                Đã có tài khoản?{' '}
                <Link href="/login" className="text-lime-600 hover:text-lime-700 font-bold underline underline-offset-4">
                  Đăng nhập tại đây
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-50 flex justify-center">
            <Link href="/" className="text-sm font-bold text-gray-400 hover:text-lime-600 transition-colors flex items-center gap-2">
              ← Quay về trang chủ
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

// 3. Export default component chính với Suspense
export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#f8faf7]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-600"></div>
      </div>
    }>
      <RegisterContent />
    </Suspense>
  )
}