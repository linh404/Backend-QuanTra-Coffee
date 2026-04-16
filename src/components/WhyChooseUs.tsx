'use client'

import { motion } from 'framer-motion'
import { Zap, ShieldCheck, RefreshCcw, Banknote } from 'lucide-react'

const features = [
  {
    id: 1,
    icon: <Zap className="w-8 h-8" />,
    title: 'Giao nhanh trong 2 giờ',
    description: 'Đơn nội thành xử lý ngay, đảm bảo thực phẩm luôn giữ được độ tươi ngon nhất.',
    color: 'from-orange-400 to-red-500'
  },
  {
    id: 2,
    icon: <ShieldCheck className="w-8 h-8" />,
    title: 'Nguồn hàng minh bạch',
    description: 'Hợp tác trực tiếp cùng nhà vườn/HTX đạt chuẩn VietGAP trên khắp cả nước.',
    color: 'from-emerald-400 to-teal-600'
  },
  {
    id: 3,
    icon: <RefreshCcw className="w-8 h-8" />,
    title: 'Đổi trả dễ dàng',
    description: 'Chính sách "Tin tưởng khách hàng", hoàn tiền ngay nếu sản phẩm lỗi hỏng.',
    color: 'from-blue-400 to-indigo-600'
  },
  {
    id: 4,
    icon: <Banknote className="w-8 h-8" />,
    title: 'Giá tốt mỗi ngày',
    description: 'Nhiều combo tiết kiệm và chương trình tích điểm cho khách hàng thân thiết.',
    color: 'from-yellow-400 to-amber-600'
  }
]

export default function WhyChooseUs() {
  return (
    <section className="relative mb-20 overflow-hidden py-12">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30">
        <div className="absolute top-10 left-10 w-64 h-64 bg-green-200 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-100 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 mb-4 text-sm font-semibold tracking-wider text-green-700 uppercase bg-green-100 rounded-full">
            Tại sao là Green Store?
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Chúng tôi khác biệt vì <span className="text-gradient-primary">Sự Tận Tâm</span>
          </h2>
          <div className="w-24 h-1.5 bg-gradient-primary mx-auto rounded-full mb-6" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              whileHover={{ y: -10 }}
              className="relative p-8 bg-white/80 backdrop-blur-sm border border-gray-100 rounded-[2rem] shadow-xl hover:shadow-2xl transition-all duration-300 group overflow-hidden"
            >
              {/* Decor Circle inside card */}
              <div className={`absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br ${feature.color} opacity-5 rounded-full group-hover:scale-150 transition-transform duration-500`} />

              <div className={`inline-flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br ${feature.color} text-white shadow-lg transform group-hover:rotate-6 transition-transform duration-300`}>
                {feature.icon}
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-3 leading-tight">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed text-sm">
                {feature.description}
              </p>

              <div className={`mt-6 w-0 group-hover:w-full h-1 bg-gradient-to-r ${feature.color} transition-all duration-500 rounded-full`} />
            </motion.div>
          ))}
        </div>

        {/* Bottom Trust Badge */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 flex flex-wrap justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500"
        >
          <div className="flex items-center gap-2 font-medium text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            10,000+ Khách hàng tin dùng
          </div>
          <div className="flex items-center gap-2 font-medium text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            100+ Nhà vườn đối tác
          </div>
        </motion.div>
      </div>
    </section>
  )
}
