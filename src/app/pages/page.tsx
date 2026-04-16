
import Link from 'next/link'
import { ChevronRight, Layout, HelpCircle, Users, MessageSquare, ArrowRight } from 'lucide-react' // Cần cài đặt lucide-react

export const metadata = {
  title: 'Khám Phá Green Store - Pages',
  description: 'Trung tâm thông tin hỗ trợ khách hàng, đội ngũ và những đánh giá thực tế về Green Store',
}

export default function PagesIndex() {
  const pages = [
    {
      title: 'Câu hỏi Thường gặp',
      href: '/pages/faq',
      icon: <HelpCircle className="w-6 h-6" />,
      image: 'https://images.unsplash.com/photo-1482192505345-5655af888cc4?auto=format&fit=crop&w=800&q=60',
      excerpt: 'Giải đáp nhanh chóng các thắc mắc về quy trình đặt hàng, thanh toán, vận chuyển và chính sách đổi trả minh bạch.',
      color: 'bg-blue-50 text-blue-600'
    },
    {
      title: 'Khách hàng nói gì?',
      href: '/pages/testimonials',
      icon: <MessageSquare className="w-6 h-6" />,
      image: 'https://plus.unsplash.com/premium_photo-1661811804102-0da6840d7327?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1172',
      excerpt: 'Những chia sẻ thực tế từ khách hàng đã tin tưởng lựa chọn sản phẩm hữu cơ tại Green Store để chăm sóc gia đình.',
      color: 'bg-amber-50 text-amber-600'
    },
    {
      title: 'Đội ngũ của chúng tôi',
      href: '/pages/team',
      icon: <Users className="w-6 h-6" />,
      image: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=800&q=60',
      excerpt: 'Gặp gỡ những con người tâm huyết đằng sau hành trình mang thực phẩm sạch và lối sống xanh đến mọi nhà.',
      color: 'bg-lime-50 text-lime-600'
    },
  ]

  return (
    <main className="min-h-screen bg-gray-50/50 pb-20">
      {/* Hero Section - Đồng bộ hoàn toàn với trang Tin Tức/Blog */}
      <section className="relative py-24 md:py-32 text-white overflow-hidden bg-gray-900">
        <div 
          className="absolute inset-0 z-0 opacity-60 bg-cover bg-center transition-transform duration-1000"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1588152850700-c82ecb8ba9b1?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170')" }}
        />
        {/* Lớp Overlay Gradient đặc trưng */}
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 relative z-20">
          <div className="flex items-center gap-2 text-lime-400 text-sm mb-6 font-semibold tracking-wide uppercase">
            <Link href="/" className="hover:text-white transition">TRANG CHỦ</Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-white bg-lime-600 px-3 py-1 rounded-full text-[10px]">THÔNG TIN</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black mb-4 drop-shadow-lg uppercase tracking-tight">
            Trung Tâm <span className="text-lime-400">Thông Tin</span>
          </h1>
          <p className="text-gray-200 text-lg md:text-xl max-w-2xl leading-relaxed drop-shadow-md">
            Mọi thứ bạn cần biết về Green Store — từ hỗ trợ khách hàng đến câu chuyện về đội ngũ thực hiện sứ mệnh sống xanh.
          </p>
        </div>
      </section>

      {/* Breadcrumb Phụ & Thống kê nhanh */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Layout className="w-4 h-4 text-lime-600" />
            <span>Khám phá <span className="font-bold text-gray-800">03</span> chuyên mục chính</span>
          </div>
          <div className="hidden sm:block">
             <span className="text-xs font-bold text-lime-700 bg-lime-50 px-3 py-1 rounded-full uppercase">Green Store Center</span>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Bạn đang tìm kiếm điều gì?</h2>
            <div className="w-20 h-1.5 bg-lime-500 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {pages.map((p) => (
              <article 
                key={p.href} 
                className="group bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 flex flex-col"
              >
                {/* Image Wrap */}
                <div className="h-60 overflow-hidden relative">
                  <img 
                    src={p.image} 
                    alt={p.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                  <div className={`absolute top-6 right-6 p-3 rounded-2xl backdrop-blur-md ${p.color} shadow-lg`}>
                    {p.icon}
                  </div>
                </div>

                {/* Content Wrap */}
                <div className="p-8 flex flex-col flex-grow">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-lime-600 transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-8 text-sm md:text-base">
                    {p.excerpt}
                  </p>
                  
                  <div className="mt-auto pt-6 border-t border-gray-50">
                    <Link 
                      href={p.href} 
                      className="flex items-center justify-between text-lime-600 font-bold group/link"
                    >
                      <span>XEM CHI TIẾT</span>
                      <div className="w-10 h-10 rounded-full bg-lime-50 flex items-center justify-center group-hover/link:bg-lime-600 group-hover/link:text-white transition-all">
                        <ArrowRight className="w-5 h-5 group-hover/link:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Banner hỗ trợ nhanh ở cuối (Call to Action) */}
      <section className="max-w-7xl mx-auto px-4 mb-20">
        <div className="bg-lime-900 rounded-[3rem] p-8 md:p-16 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/leaf.png')]" />
          <div className="relative z-10">
            <h3 className="text-2xl md:text-4xl font-bold mb-6">Bạn vẫn còn thắc mắc khác?</h3>
            <p className="text-lime-100 mb-10 max-w-xl mx-auto text-lg opacity-90">
              Đừng ngần ngại liên hệ trực tiếp với đội ngũ hỗ trợ của chúng tôi để được tư vấn chi tiết hơn.
            </p>
            <Link 
              href="/contact" 
              className="inline-block bg-white text-lime-900 font-black px-10 py-4 rounded-full shadow-xl hover:bg-lime-400 hover:text-white transition-all transform hover:scale-105"
            >
              LIÊN HỆ NGAY
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
