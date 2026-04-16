import Link from "next/link"
import Image from "next/image"
import { ChevronRight, HelpCircle, ShoppingBag, Truck, RotateCcw, Leaf, Search, Plus } from "lucide-react"

export const metadata = {
  title: "Câu hỏi Thường gặp - Green Store",
  description: "Giải đáp các câu hỏi phổ biến về đặt hàng, giao hàng, thanh toán, đổi trả và chính sách tại Green Store.",
}

const faqCategories = [
  {
    title: "Đặt hàng & Thanh toán",
    icon: <ShoppingBag className="w-6 h-6" />,
    color: "bg-blue-50 text-blue-600",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=60",
    faqs: [
      { q: "Làm thế nào để đặt hàng trên website?", a: "Chọn sản phẩm → Thêm vào giỏ hàng → Nhập địa chỉ → Chọn phương thức thanh toán → Xác nhận đơn hàng." },
      { q: "Tôi có cần tạo tài khoản để mua hàng không?", a: "Không bắt buộc. Tuy nhiên, tạo tài khoản giúp theo dõi đơn hàng và nhận ưu đãi tốt hơn." },
      { q: "Green Store hỗ trợ những phương thức thanh toán nào?", a: "COD, chuyển khoản ngân hàng, ví điện tử và thanh toán online qua cổng bảo mật." },
    ]
  },
  {
    title: "Giao hàng & Theo dõi đơn",
    icon: <Truck className="w-6 h-6" />,
    color: "bg-amber-50 text-amber-600",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=60",
    faqs: [
      { q: "Thời gian giao hàng mất bao lâu?", a: "Nội thành: 1–3 ngày. Tỉnh khác: 2–5 ngày tùy khu vực." },
      { q: "Tôi có thể theo dõi đơn hàng ở đâu?", a: "Đăng nhập → Vào mục Đơn hàng → Xem trạng thái hoặc dùng mã tracking gửi qua email." },
    ]
  },
  {
    title: "Đổi trả & Hoàn tiền",
    icon: <RotateCcw className="w-6 h-6" />,
    color: "bg-red-50 text-red-600",
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=60",
    faqs: [
      { q: "Chính sách đổi trả như thế nào?", a: "Đổi trả trong 7 ngày nếu sản phẩm lỗi hoặc hư hỏng do vận chuyển." },
      { q: "Thời gian hoàn tiền mất bao lâu?", a: "Từ 3–7 ngày làm việc tùy phương thức thanh toán." },
    ]
  },
  {
    title: "Sản phẩm & Bảo quản",
    icon: <Leaf className="w-6 h-6" />,
    color: "bg-lime-50 text-lime-600",
    image: "https://images.unsplash.com/photo-1474440692490-2e83ae13ba29?auto=format&fit=crop&w=1200&q=60",
    faqs: [
      { q: "Sản phẩm có nguồn gốc rõ ràng không?", a: "Tất cả sản phẩm đều có thông tin nhà cung cấp và tiêu chuẩn kiểm định." },
      { q: "Rau củ nên bảo quản như thế nào?", a: "Giữ ở ngăn mát 4–8°C và dùng trong 3–5 ngày." },
    ]
  }
]

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-gray-50/50 pb-20">

      {/* Hero Section - Ăn khớp với Pages Index */}
      <section className="relative py-24 md:py-32 text-white overflow-hidden bg-gray-900">
        <div 
          className="absolute inset-0 z-0 opacity-60 bg-cover bg-center transition-transform duration-1000"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1482192505345-5655af888cc4?auto=format&fit=crop&w=1400&q=60')" }}
        />
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 relative z-20">
          <div className="flex items-center gap-2 text-lime-400 text-sm mb-6 font-semibold tracking-wide uppercase">
            <Link href="/" className="hover:text-white transition">TRANG CHỦ</Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link href="/pages" className="hover:text-white transition">PAGES</Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-white bg-lime-600 px-3 py-1 rounded-full text-[10px]">FAQ</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black mb-4 drop-shadow-lg uppercase tracking-tight">
            Giải Đáp <span className="text-lime-400">Thắc Mắc</span>
          </h1>
          <p className="text-gray-200 text-lg md:text-xl max-w-2xl leading-relaxed drop-shadow-md">
            Tìm câu trả lời nhanh nhất cho những thắc mắc thường gặp của bạn về hành trình mua sắm tại Green Store.
          </p>

          {/* Thanh tìm kiếm nhanh giả lập */}
          <div className="mt-10 relative max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-lime-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Bạn cần hỗ trợ điều gì?..." 
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder:text-gray-400 focus:bg-white focus:text-gray-900 focus:outline-none focus:ring-4 focus:ring-lime-500/20 transition-all shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* FAQ CONTENT */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 space-y-20">

          {faqCategories.map((category, index) => (
            <div key={index} className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
              
              {/* Bên trái: Category Card - Đồng bộ phong cách Pages Index */}
              <div className="lg:col-span-1 sticky top-24">
                <div className="group bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 transition-all duration-500 hover:shadow-xl">
                  <div className="h-48 overflow-hidden relative">
                    <Image
                      src={category.image}
                      alt={category.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors" />
                    <div className={`absolute top-6 right-6 p-3 rounded-2xl backdrop-blur-md ${category.color} shadow-lg`}>
                      {category.icon}
                    </div>
                  </div>
                  <div className="p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{category.title}</h2>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      Thông tin chi tiết và các câu hỏi liên quan đến {category.title.toLowerCase()}.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bên phải: Accordion Questions */}
              <div className="lg:col-span-2 space-y-4">
                {category.faqs.map((faq, i) => (
                  <details
                    key={i}
                    className="group bg-white border border-gray-100 rounded-[1.5rem] p-6 transition-all duration-300 hover:shadow-md hover:border-lime-200"
                  >
                    <summary className="flex justify-between items-center cursor-pointer font-bold text-gray-800 text-lg list-none group-open:text-lime-600 transition-colors">
                      <span className="flex items-center gap-4">
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-50 text-gray-400 text-xs flex items-center justify-center group-hover:bg-lime-50 group-hover:text-lime-600 transition-colors">
                          0{i + 1}
                        </span>
                        {faq.q}
                      </span>
                      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-lime-50 transition-colors">
                        <Plus className="w-5 h-5 transition-transform duration-300 group-open:rotate-45 text-gray-400 group-open:text-lime-600" />
                      </div>
                    </summary>

                    <div className="mt-6 pl-12 text-gray-600 leading-relaxed border-t border-gray-50 pt-6 animate-in fade-in slide-in-from-top-2 duration-300">
                      <p className="bg-lime-50/50 p-4 rounded-2xl border-l-4 border-lime-500">
                        {faq.a}
                      </p>
                    </div>
                  </details>
                ))}
              </div>

            </div>
          ))}

          {/* Support CTA Section */}
          <div className="bg-lime-900 rounded-[3rem] p-12 text-center text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-64 h-64 bg-lime-500/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
            <div className="relative z-10">
              <h3 className="text-3xl font-bold mb-4">Bạn vẫn cần trợ giúp?</h3>
              <p className="text-lime-100 opacity-80 mb-8 max-w-lg mx-auto">
                Nếu không tìm thấy câu trả lời, đừng ngần ngại chat trực tiếp hoặc gửi yêu cầu cho chúng tôi.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/contact" className="bg-white text-lime-900 px-8 py-3 rounded-full font-black shadow-lg hover:bg-lime-400 hover:text-white transition-all transform hover:scale-105">
                  LIÊN HỆ CSKH
                </Link >
                <Link href="/pages/policy" className="bg-white text-lime-900 px-8 py-3 rounded-full font-black shadow-lg hover:bg-lime-400 hover:text-white transition-all transform hover:scale-105">
                  TRUY CẬP CHÍNH SÁCH
                </Link >
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Structured Data (Schema.org) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqCategories.flatMap(category =>
              category.faqs.map(faq => ({
                "@type": "Question",
                name: faq.q,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: faq.a
                }
              }))
            )
          })
        }}
      />
    </main>
  )
}