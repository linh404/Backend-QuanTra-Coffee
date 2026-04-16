
'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Star } from 'lucide-react'

const testimonials = [
  {
    id: 1,
    name: 'Nguyễn Thị Mai',
    location: 'Hà Nội',
    avatar: 'https://images.unsplash.com/photo-1534083220759-4c3c00112ea0?q=80&w=687&auto=format&fit=crop',
    content: 'Rau củ rất tươi, giao hàng nhanh. Tôi đặt buổi sáng, chiều đã nhận được. Chất lượng tốt, giá cả hợp lý.',
    rating: 5
  },
  {
    id: 2,
    name: 'Trần Văn Hùng',
    location: 'TP. Hồ Chí Minh',
    avatar: 'https://images.unsplash.com/photo-1542071910-d36d1cbc379a?q=80&w=880&auto=format&fit=crop',
    content: 'Đặc sản vùng miền rất ngon, đúng như mô tả. Shop đóng gói cẩn thận, nhiệt tình. Sẽ tiếp tục ủng hộ.',
    rating: 5
  },
  {
    id: 3,
    name: 'Lê Thị Hương',
    location: 'Đà Nẵng',
    avatar: 'https://images.unsplash.com/photo-1554690245-98ec87aff45d?q=80&w=687&auto=format&fit=crop',
    content: 'Hoa quả nhập khẩu rất tươi và ngon. Nguồn gốc rõ ràng, giá tốt hơn siêu thị.',
    rating: 5
  },
  {
    id: 4,
    name: 'Trần Noãn Thụ',
    location: 'Đà Nẵng',
    avatar: 'https://images.unsplash.com/photo-1761014219609-39665216fa8e?q=80&w=687&auto=format&fit=crop',
    content: 'Hoa quả nhập khẩu ở núi Lạc Phách rất tươi và ngon. Gia đình tôi rất hài lòng.',
    rating: 5
  }
]

// Nhân bản danh sách để tạo hiệu ứng lặp vô tận mượt mà
const infiniteTestimonials = [...testimonials, ...testimonials];

export default function Testimonials() {
  return (
    <section className="mb-24 py-20 relative overflow-hidden group">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#f8fafc] to-white -z-10" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-200 to-transparent" />

      <div className="container mx-auto px-4 mb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 uppercase tracking-tighter">
            Trải nghiệm <span className="text-gradient-primary">Khách hàng</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-lg">
            Sự hài lòng của bạn là động lực lớn nhất để Green Store hoàn thiện mỗi ngày
          </p>
        </motion.div>
      </div>

      {/* Slider Container */}
      <div className="relative flex overflow-hidden py-10">
        <motion.div
          className="flex gap-8 px-4"
          animate={{
            x: ['0%', '-50%'],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 40, // Tốc độ chạy (giây)
              ease: "linear",
            },
          }}
          style={{ width: "fit-content" }}
          whileHover={{ animationPlayState: "paused" }} // Tạm dừng khi di chuột vào
        >
          {infiniteTestimonials.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className="w-[350px] md:w-[400px] flex-shrink-0 bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 relative group/card"
            >
              {/* Quote Icon Decor */}
              <span className="absolute top-6 right-8 text-6xl text-green-50 font-serif leading-none select-none group-hover/card:text-green-100 transition-colors">“</span>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-inner ring-4 ring-green-50">
                  <Image
                    src={item.avatar}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg leading-none mb-1">{item.name}</h4>
                  <p className="text-sm text-green-600 font-medium">{item.location}</p>
                </div>
              </div>

              <div className="flex gap-1 mb-4">
                {[...Array(item.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              <p className="text-gray-600 leading-relaxed italic relative z-10">
                "{item.content}"
              </p>

              {/* Bottom Decor Line */}
              <div className="mt-6 w-12 h-1 bg-gradient-to-r from-green-400 to-emerald-600 rounded-full group-hover/card:w-full transition-all duration-700" />
            </div>
          ))}
        </motion.div>

        {/* Gradient Mask giúp che hai đầu mượt mà */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#f8fafc] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#f8fafc] to-transparent z-10 pointer-events-none" />
      </div>
    </section>
  )
}