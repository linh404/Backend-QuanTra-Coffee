'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import toast from 'react-hot-toast'
import { Mail, Lock, LogIn, ArrowLeft, Leaf } from 'lucide-react'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      
      if (data.success) {
        login(data.data.user, data.data.token)
        toast.success('Chào mừng bạn quay trở lại!')
        data.data.user.role === 'admin' ? router.push('/admin/orders') : router.push('/')
      } else {
        toast.error(data.error || 'Đăng nhập thất bại')
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi đăng nhập')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const inputClass = "w-full pl-10 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-lime-500 transition-all outline-none"

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8faf7] pt-20 pb-12 px-4 relative overflow-hidden">
      {/* Họa tiết lá trang trí đồng bộ với trang Register */}
      <Leaf className="absolute -top-12 -left-12 w-64 h-64 text-lime-100 -rotate-45 opacity-50 pointer-events-none" />
      <Leaf className="absolute -bottom-12 -right-12 w-64 h-64 text-lime-100 rotate-12 opacity-50 pointer-events-none" />

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center">
          <div className="inline-flex p-4 bg-white rounded-3xl shadow-sm mb-6">
             <div className="flex items-center justify-center w-12 h-12 bg-lime-500 rounded-2xl text-white">
                <Leaf className="w-8 h-8" />
             </div>
          </div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">
            Mừng Bạn <span className="text-lime-600">Trở Lại</span>
          </h2>
          <p className="mt-3 text-gray-500 font-medium italic">
            "Tiếp tục hành trình sống xanh cùng Green Store"
          </p>
        </div>
        
        <form className="mt-8 space-y-6 bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-lime-100/50 border border-gray-100" onSubmit={handleSubmit}>
          <div className="space-y-5">
            {/* Email Input */}
            <div className="relative group">
              <label htmlFor="email" className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2">
                Email của bạn
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-lime-500 transition-colors" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="name@example.com"
                />
              </div>
            </div>
            
            {/* Password Input */}
            <div className="relative group">
              <div className="flex justify-between items-center ml-1 mb-2">
                <label htmlFor="password" className="block text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Mật khẩu
                </label>
                <Link href="#" className="text-xs font-bold text-lime-600 hover:text-lime-700"> Quên mật khẩu? </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-lime-500 transition-colors" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center items-center gap-2 py-4 px-4 bg-lime-600 hover:bg-lime-700 text-white font-bold rounded-2xl shadow-lg shadow-lime-200 transition-all transform active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  ĐĂNG NHẬP NGAY <LogIn className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

          <div className="text-center pt-2">
            <p className="text-sm text-gray-500 font-medium">
              Chưa có tài khoản?{' '}
              <Link href="/register" className="text-lime-600 hover:text-lime-700 font-bold underline underline-offset-4">
                Tạo tài khoản mới
              </Link>
            </p>
          </div>

          <div className="pt-6 border-t border-gray-50 flex justify-center">
            <Link href="/" className="text-sm font-bold text-gray-400 hover:text-lime-600 transition-colors flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Quay về trang chủ
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}