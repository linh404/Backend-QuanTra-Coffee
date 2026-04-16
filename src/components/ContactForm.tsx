/*"use client"
import React, { useState } from 'react'

export default function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, subject, message }),
      })

      if (!res.ok) throw new Error('Lỗi khi gửi yêu cầu')

      setSuccess('Cảm ơn! Chúng tôi đã nhận được tin nhắn của bạn.')
      setName('')
      setEmail('')
      setPhone('')
      setSubject('')
      setMessage('')
    } catch (err: any) {
      setError(err?.message || 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded">{success}</div>}
      {error && <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Họ và tên" className="border px-3 py-2 rounded w-full" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Email của bạn" type="email" className="border px-3 py-2 rounded w-full" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Điện thoại" className="border px-3 py-2 rounded w-full" />
        <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Chủ đề" className="border px-3 py-2 rounded w-full sm:col-span-2" />
      </div>

      <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Nội dung" rows={6} className="border px-3 py-2 rounded w-full" />

      <div>
        <button type="submit" disabled={loading} className="bg-lime-600 text-white px-5 py-2 rounded shadow">
          {loading ? 'Đang gửi...' : 'GỬI YÊU CẦU'}
        </button>
      </div>
    </form>
  )
}*/
"use client"
import React, { useState } from 'react'
import { Send, User, Mail, Phone, Tag, MessageSquare } from 'lucide-react' // Cần cài đặt lucide-react

export default function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, subject, message }),
      })

      if (!res.ok) throw new Error('Lỗi khi gửi yêu cầu')

      setSuccess('Cảm ơn! Chúng tôi đã nhận được tin nhắn của bạn.')
      setName(''); setEmail(''); setPhone(''); setSubject(''); setMessage('');
    } catch (err: any) {
      setError(err?.message || 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none transition-all duration-200"

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 md:p-10 rounded-2xl shadow-xl border border-gray-100">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-800">Gửi lời nhắn cho chúng tôi</h3>
        <p className="text-gray-500 mt-2 text-sm">Chúng tôi sẽ phản hồi bạn trong vòng 24 giờ làm việc.</p>
      </div>

      {success && <div className="p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-r-lg animate-fade-in">{success}</div>}
      {error && <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg animate-fade-in">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Họ và tên *" className={inputClass} />
        </div>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" placeholder="Email của bạn *" className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Số điện thoại" className={inputClass} />
        </div>
        <div className="relative">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Chủ đề quan tâm" className={inputClass} />
        </div>
      </div>

      <div className="relative">
        <MessageSquare className="absolute left-3 top-4 text-gray-400 w-5 h-5" />
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Nội dung tin nhắn..." rows={5} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none transition-all duration-200" />
      </div>

      <button type="submit" disabled={loading} className="w-full bg-lime-600 hover:bg-lime-700 text-white font-bold py-4 rounded-lg shadow-lg flex items-center justify-center gap-2 transform active:scale-[0.98] transition-all disabled:opacity-70">
        {loading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /> : (
          <>
            <span>GỬI YÊU CẦU NGAY</span>
            <Send className="w-5 h-5" />
          </>
        )}
      </button>
    </form>
  )
}
