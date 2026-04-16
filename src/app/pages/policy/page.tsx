import { Suspense } from 'react'
import Link from 'next/link'
import { ChevronRight, ShieldCheck, Truck, RotateCcw, CreditCard, FileText, Info, ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'Chính sách cửa hàng - Green Store',
  description: 'Chính sách giao hàng, hoàn trả, bảo mật và điều khoản sử dụng tại Green Store',
}

function PolicyContent() {
  const policies = [
    {
      id: 'shipping',
      title: 'Chính sách giao hàng',
      icon: <Truck className="w-6 h-6" />,
      color: 'bg-blue-50 text-blue-600',
      content: (
        <>
          <p className="mb-4">Green Store hỗ trợ giao hàng trên toàn quốc thông qua các đối tác vận chuyển uy tín. Thời gian giao hàng dự kiến từ <strong>1 – 5 ngày làm việc</strong> tùy theo khu vực.</p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <li className="flex items-center gap-2 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>Nội thành: 1 – 2 ngày</span>
            </li>
            <li className="flex items-center gap-2 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>Liên tỉnh: 2 – 5 ngày</span>
            </li>
          </ul>
          <p className="text-sm text-gray-500 italic border-l-4 border-blue-200 pl-4">Trong trường hợp phát sinh chậm trễ do thời tiết hoặc sự cố ngoài ý muốn, chúng tôi sẽ chủ động thông báo sớm nhất.</p>
        </>
      )
    },
    {
      id: 'return',
      title: 'Chính sách đổi trả',
      icon: <RotateCcw className="w-6 h-6" />,
      color: 'bg-amber-50 text-amber-600',
      content: (
        <>
          <p className="mb-4">Chúng tôi hỗ trợ đổi trả sản phẩm trong vòng <strong>07 ngày</strong> kể từ ngày nhận hàng nếu lỗi thuộc về nhà sản xuất hoặc vận chuyển.</p>
          <div className="space-y-3">
            {['Sản phẩm lỗi do sản xuất', 'Hư hỏng do vận chuyển', 'Giao sai mẫu mã/số lượng', 'Sản phẩm còn nguyên tem nhãn'].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-gray-700">
                <ShieldCheck className="w-5 h-5 text-amber-500" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </>
      )
    },
    {
      id: 'privacy',
      title: 'Bảo mật thông tin',
      icon: <ShieldCheck className="w-6 h-6" />,
      color: 'bg-lime-50 text-lime-600',
      content: (
        <>
          <p className="mb-4 text-gray-700">Green Store cam kết bảo mật tuyệt đối mọi thông tin cá nhân của khách hàng. Thông tin chỉ được sử dụng cho mục đích:</p>
          <div className="flex flex-wrap gap-2">
            {['Xử lý đơn hàng', 'Chăm sóc khách hàng', 'Gửi khuyến mãi'].map((tag, i) => (
              <span key={i} className="px-4 py-2 bg-lime-100 text-lime-700 rounded-full text-xs font-bold uppercase tracking-wider">
                # {tag}
              </span>
            ))}
          </div>
        </>
      )
    },
    {
      id: 'payment',
      title: 'Chính sách thanh toán',
      icon: <CreditCard className="w-6 h-6" />,
      color: 'bg-purple-50 text-purple-600',
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {['COD (Tiền mặt)', 'Chuyển khoản', 'Ví điện tử'].map((method, i) => (
            <div key={i} className="text-center p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="font-bold text-gray-800">{method}</div>
            </div>
          ))}
        </div>
      )
    }
  ]

  return (
    <main className="min-h-screen bg-gray-50/50 pb-20">
      {/* Hero Section - Đồng bộ tuyệt đối */}
      <section className="relative py-24 md:py-32 text-white overflow-hidden bg-gray-900">
        <div 
          className="absolute inset-0 z-0 opacity-60 bg-cover bg-center transition-transform duration-1000"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1499529112087-3cb3b73cec95?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1074')" }}
        />
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 relative z-20">
          <div className="flex items-center gap-2 text-lime-400 text-sm mb-6 font-semibold tracking-wide uppercase">
            <Link href="/" className="hover:text-white transition">TRANG CHỦ</Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link href="/pages" className="hover:text-white transition">PAGES</Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-white bg-lime-600 px-3 py-1 rounded-full text-[10px]">CHÍNH SÁCH</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black mb-4 drop-shadow-lg uppercase tracking-tight">
            Quyền Lợi & <span className="text-lime-400">Cam Kết</span>
          </h1>
          <p className="text-gray-200 text-lg md:text-xl max-w-2xl leading-relaxed drop-shadow-md">
            Chúng tôi xây dựng các chính sách minh bạch nhằm đảm bảo quyền lợi tốt nhất cho khách hàng trong suốt hành trình mua sắm.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            
            {/* Sidebar Navigation */}
            <aside className="lg:col-span-1 space-y-6">
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 sticky top-24">
                <h3 className="font-bold text-gray-900 text-lg mb-6 flex items-center gap-2">
                  <Info className="w-5 h-5 text-lime-500" />
                  Mục lục
                </h3>
                <nav className="space-y-2">
                  {policies.map((p) => (
                    <a 
                      key={p.id} 
                      href={`#${p.id}`} 
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-lime-50 text-gray-600 hover:text-lime-600 transition group font-medium text-sm"
                    >
                      {p.title}
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Content Area */}
            <div className="lg:col-span-3 space-y-12">
              <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-gray-100">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Chính sách chung</h2>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Green Store cam kết mang đến cho khách hàng những sản phẩm chất lượng cao, nguồn gốc rõ ràng và dịch vụ chăm sóc tận tâm. Các chính sách dưới đây được xây dựng nhằm đảm bảo quyền lợi của khách hàng cũng như duy trì tiêu chuẩn hoạt động minh bạch, chuyên nghiệp và bền vững.
                </p>
              </div>

              {/* Policy Sections */}
              {policies.map((policy) => (
                <article 
                  id={policy.id} 
                  key={policy.id} 
                  className="group bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-500 p-8 md:p-12 scroll-mt-24"
                >
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className={`p-5 rounded-3xl ${policy.color} shadow-inner flex-shrink-0`}>
                      {policy.icon}
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-2xl font-black text-gray-900 mb-6 uppercase tracking-tight group-hover:text-lime-600 transition">
                        {policy.title}
                      </h3>
                      <div className="text-gray-600 leading-relaxed">
                        {policy.content}
                      </div>
                    </div>
                  </div>
                </article>
              ))}

              {/* Điều khoản sử dụng Card */}
              <div className="bg-lime-900 rounded-[3rem] p-10 md:p-16 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 opacity-10 translate-x-1/4 -translate-y-1/4">
                  <FileText className="w-48 h-48" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-1 bg-lime-400 rounded-full"></div>
                    <h3 className="text-2xl font-bold uppercase">Điều khoản sử dụng</h3>
                  </div>
                  <p className="text-lime-100 text-lg leading-relaxed mb-8">
                    Khi truy cập và mua sắm tại Green Store, khách hàng đồng ý tuân thủ các điều khoản và điều kiện được công bố trên website. Chúng tôi có quyền cập nhật chính sách bất cứ lúc nào để phù hợp với quy định pháp luật.
                  </p>
                  <Link 
                    href="/contact" 
                    className="flex items-center gap-2 text-white font-bold hover:gap-4 transition-all group/btn underline decoration-lime-500 decoration-2 underline-offset-8"
                  >
                    BẠN CÓ THẮC MẮC? LIÊN HỆ CHÚNG TÔI <ArrowRight className="w-5 h-5 text-lime-400" />
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default function PolicyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-lime-600"></div>
      </div>
    }>
      <PolicyContent />
    </Suspense>
  )
}