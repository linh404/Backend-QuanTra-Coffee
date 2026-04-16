
'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, User, ArrowRight, Leaf } from 'lucide-react' // Sử dụng lucide-react cho hiện đại

interface BlogPost {
  id: number
  title: string
  excerpt: string
  image: string
  slug: string
  date: string
  author: string
  category: string
}

// Giả sử lấy 3 bài viết nổi bật để đảm bảo layout đẹp nhất
const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: 'Mùa nào ăn món gì? Bí quyết chọn rau củ theo mùa',
    excerpt: 'Ăn rau củ theo mùa không chỉ đảm bảo độ tươi ngon mà còn giúp cơ thể hấp thụ tốt nhất các dưỡng chất...',
    image: 'https://images.unsplash.com/photo-1568494354449-e64255cf9120?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    slug: 'mua-nao-an-mon-gi',
    date: '15/10/2025',
    author: 'Tề Tĩnh Xuân',
    category: 'Mẹo hay'
  },
  {
    id: 2,
    title: 'Bí quyết chọn hoa quả tươi ngon, tránh hóa chất',
    excerpt: 'Làm thế nào để nhận biết hoa quả tươi ngon, không chứa chất bảo quản? Những mẹo đơn giản giúp bạn...',
    image: 'https://images.unsplash.com/photo-1653233797467-1a528819fd4f?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    slug: 'bi-quyet-chon-hoa-qua-tuoi',
    date: '12/10/2025',
    author: 'Trĩ Khuê',
    category: 'Kiến thức'
  },
  {
    id: 3,
    title: '5 loại rau củ giúp tăng cường miễn dịch mùa đông',
    excerpt: 'Mùa đông là thời điểm cơ thể dễ bị suy giảm miễn dịch. Bổ sung những loại rau củ này sẽ giúp bạn...',
    image: 'https://images.unsplash.com/photo-1657288089316-c0350003ca49?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    slug: 'rau-cu-tang-cuong-mien-dich',
    date: '08/10/2025',
    author: 'Trần Thanh Đô',
    category: 'Sức khỏe'
  },
]

export default function BlogTeasers() {
  return (
    <section className="py-20 bg-[#f9fbf7] overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header với phong cách hiện đại */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-2 text-[#6a9739] font-bold uppercase tracking-widest text-sm mb-4">
              <Leaf className="w-5 h-5" />
              <span>Blog & Chia sẻ</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
              Sống Xanh Mỗi Ngày <br />
              <span className="text-[#6a9739]">Cùng Green Store</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Link
              href="/blog"
              className="group flex items-center gap-3 text-lg font-bold text-gray-900 hover:text-[#6a9739] transition-colors"
            >
              Xem tất cả bài viết
              <div className="w-12 h-12 rounded-full border-2 border-gray-200 flex items-center justify-center group-hover:border-[#6a9739] group-hover:bg-[#6a9739] group-hover:text-white transition-all">
                <ArrowRight className="w-5 h-5" />
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Grid bài viết */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {blogPosts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="group relative"
            >
              {/* Card Image Wrapper */}
              <div className="relative h-[400px] w-full rounded-[2rem] overflow-hidden shadow-xl mb-6">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                
                {/* Category Badge - Hiện đại hơn */}
                <div className="absolute top-6 left-6">
                  <span className="backdrop-blur-md bg-white/20 text-white border border-white/30 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                    {post.category}
                  </span>
                </div>

                {/* Info nấp dưới ảnh khi hover sẽ trồi lên nhẹ */}
                <div className="absolute bottom-8 left-8 right-8 text-white transform transition-transform duration-500">
                  <div className="flex items-center gap-4 text-xs font-medium mb-3 opacity-90">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#a3d95d]" />
                      {post.date}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#a3d95d]" />
                      {post.author}
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Content - Tách biệt phía dưới để dễ đọc */}
              <div className="px-2">
                <Link href={`/blog/${post.slug}`}>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 line-clamp-2 group-hover:text-[#6a9739] transition-colors leading-snug">
                    {post.title}
                  </h3>
                </Link>
                <p className="text-gray-600 line-clamp-2 text-sm leading-relaxed mb-6">
                  {post.excerpt}
                </p>
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-2 font-bold text-sm uppercase tracking-wider text-[#6a9739] group/btn"
                >
                  Khám phá ngay
                  <span className="w-8 h-[2px] bg-[#6a9739] transition-all group-hover/btn:w-12" />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
