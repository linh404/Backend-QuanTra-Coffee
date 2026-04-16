/*import Link from 'next/link'
import ContactForm from '@/components/ContactForm'

export const metadata = {
  title: 'Contact Us - Green Store',
  description: 'Liên hệ với Green Store - đặt câu hỏi, khiếu nại hoặc hợp tác',
}

export default function ContactPage() {
  return (
    <main className="min-h-screen">
      {/* Hero /}
      <section className="relative">
        <div
          className="h-56 sm:h-72 lg:h-96 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1332')" }}
        >
          <div className="absolute inset-0 bg-black/60 pointer-events-none" />
          <div className="relative z-10 flex items-center justify-center h-full">
            <div className="text-center text-white px-4">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold">LIÊN HỆ</h1>
              <p className="mt-2 text-sm sm:text-base opacity-90">CHÀO MỪNG ĐẾN VỚI NHÀ CUNG CẤP SẢN PHẨM HỮU CƠ CHỨNG NHẬN TRỰC TUYẾN</p>
            </div>
          </div>
        </div>

        <div className="bg-white relative z-10">
          <div className="max-w-7xl mx-auto px-4 py-3 text-sm text-gray-600 flex items-center justify-between">
            <nav className="flex items-center gap-2">
              <Link href="/" className="hover:text-lime-600">TRANG CHỦ</Link>
              <span className="text-gray-300">&gt;</span>
              <span className="text-lime-600 font-semibold">LIÊN HỆ</span>
            </nav>
            <div className="text-sm text-gray-500">Đặt hàng qua điện thoại: <span className="font-semibold">+84 123 456 789</span></div>
          </div>
        </div>
      </section>

      {/* Content /}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white p-8 rounded shadow">
                <h2 className="text-xl text-gray-600 font-bold mb-4">LIÊN HỆ VỚI CHÚNG TÔI</h2>
                <p className="text-sm text-gray-600 mb-6">Bạn có câu hỏi? Gửi cho chúng tôi thông tin và chúng tôi sẽ liên hệ lại sớm nhất có thể.</p>

                <ContactForm />
              </div>
            </div>

            <aside>
              <div className="bg-white p-6 rounded shadow">
                <h3 className="font-semibold  text-gray-700 mb-3">LIÊN HỆ</h3>
                <ul className="text-sm space-y-3 text-gray-700">
                  <li>
                    <div className="font-semibold">Địa chỉ</div>
                    <div className="text-gray-500">Số 271, Tòa nhà Hội Chữ thập đỏ, Phường Quang Trung, Thành phố Thái Nguyên, Việt Nam</div>
                  </li>
                  <li>
                    <div className="font-semibold">Email</div>
                    <div className="text-gray-500">greentore@gmail.com</div>
                  </li>
                  <li>
                    <div className="font-semibold">Điện thoại</div>
                    <div className="text-gray-500">+84 123 456 789</div>
                  </li>
                </ul>

                <div className="mt-6">
                  <h4 className="font-semibold  text-gray-700 ">GIỜ LÀM VIỆC</h4>
                  <div className="text-sm text-gray-600 mt-2">
                    Thứ Hai - Thứ Sáu: 09.00am đến 07.00pm<br />
                    Thứ Bảy: 10.00am đến 05.00pm<br />
                    Chủ Nhật: Đóng cửa
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Map /}
      <section>
  <div className="max-w-7xl mx-auto px-4">
    <div className="rounded-xl overflow-hidden shadow-lg border">
      <iframe
        title="company-location-thai-nguyen"
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d107441.6517789967!2d105.72108749490015!3d21.577516976295705!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x313526e41a2f48ff%3A0x9af085049fb0466f!2zVHAuIFRow6FpIE5ndXnDqm4sIFRow6FpIE5ndXnDqm4sIFZp4buHdCBOYW0!5e1!3m2!1svi!2s!4v1772523494732!5m2!1svi!2s"
        className="w-full h-72 md:h-96 lg:h-[500px] border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
      </div>
      </div>
      </section>
    </main>
  )
}*/
import Link from 'next/link'
import ContactForm from '@/components/ContactForm'
import { MapPin, Mail, Phone, Clock, Facebook, Instagram, Youtube } from 'lucide-react'

export const metadata = {
  title: 'Contact Us - Green Store',
  description: 'Liên hệ với Green Store - đặt câu hỏi, khiếu nại hoặc hợp tác',
}

export default function ContactPage() {
  const contactInfo = [
    { icon: <MapPin className="w-6 h-6" />, title: "Địa chỉ", details: "Số 271, Phường Quang Trung, TP. Thái Nguyên", color: "bg-blue-50 text-blue-600" },
    { icon: <Mail className="w-6 h-6" />, title: "Email", details: "greentore@gmail.com", color: "bg-red-50 text-red-600" },
    { icon: <Phone className="w-6 h-6" />, title: "Hotline", details: "+84 123 456 789", color: "bg-green-50 text-green-600" },
    { icon: <Clock className="w-6 h-6" />, title: "Giờ làm việc", details: "Thứ 2 - Thứ 7 (09:00 - 19:00)", color: "bg-amber-50 text-amber-600" },
  ]

  return (
    <main className="min-h-screen bg-gray-50/50">
      {/* Hero Section */}
      <section className="relative py-20 bg-lime-900 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://plus.unsplash.com/premium_photo-1669584354883-c78def402801?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')]" />
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Liên Hệ Với Green Store</h1>
          <p className="text-lime-100 text-lg max-w-2xl mx-auto">Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn mang những sản phẩm hữu cơ tốt nhất đến gia đình.</p>
          <div className="mt-8 flex justify-center gap-3 text-sm">
             <Link href="/" className="text-white hover:text-lime-400 transition">Trang chủ</Link>
             <span className="text-lime-500">/</span>
             <span className="text-lime-400 font-medium">Liên hệ</span>
          </div>
        </div>
      </section>

      <section className="py-16 -mt-10 relative z-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left side: Info & Socials */}
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                {contactInfo.map((item, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition">
                    <div className={`p-3 rounded-xl ${item.color}`}>{item.icon}</div>
                    <div>
                      <h4 className="font-bold text-gray-800">{item.title}</h4>
                      <p className="text-gray-500 text-sm mt-1">{item.details}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h4 className="font-bold text-gray-800 mb-4">Kết nối với chúng tôi</h4>
                <div className="flex gap-4">
                  {[<Facebook />, <Instagram />, <Youtube />].map((social, i) => (
                    <a key={i} href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-lime-600 hover:text-white transition">
                      {social}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Right side: Contact Form */}
            <div className="lg:col-span-2">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800">Tìm thấy chúng tôi trên bản đồ</h2>
            <div className="w-20 h-1 bg-lime-500 mx-auto mt-4 rounded-full" />
          </div>
          <div className="rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
            <iframe
              title="company-location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3710.023477156942!2d105.8436573!3d21.58504!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x313527393430489b%3A0xe54c153676c5b964!2zMjcxeiwgUXVhbmcgVHJ1bmcsIFRow6FpIE5ndXnDqm4!5e0!3m2!1svi!2s!4v1700000000000"
              className="w-full h-[450px] border-0 grayscale hover:grayscale-0 transition-all duration-700"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </main>
  )
}
