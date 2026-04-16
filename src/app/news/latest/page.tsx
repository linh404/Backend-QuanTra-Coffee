import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { posts } from '@/lib/news-data';
import { Calendar, Clock, ChevronRight, Bookmark, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Tin mới nhất - Green Store',
  description: 'Các tin tức mới nhất và bài viết nổi bật từ Green Store',
};

function LatestNewsContent() {
  // Sắp xếp bài viết mới nhất lên đầu
  const sorted = [...posts].sort((a, b) => (new Date(b.date).getTime() - new Date(a.date).getTime()));

  return (
    <main className="min-h-screen bg-gray-50/50">
      {/* Hero Section - Đồng bộ với trang News */}
      <section className="relative py-24 md:py-32 text-white overflow-hidden bg-gray-900">
        <div 
          className="absolute inset-0 z-0 opacity-60 bg-cover bg-center transition-transform duration-1000"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1482192505345-5655af888cc4?auto=format&fit=crop&w=1400&q=60')" }}
        />
        {/* Gradient overlay giúp nhìn rõ ảnh và nổi bật chữ */}
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 relative z-20">
          <div className="flex items-center gap-2 text-lime-400 text-sm mb-6 font-semibold tracking-wide uppercase">
            <Link href="/" className="hover:text-white transition">TRANG CHỦ</Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link href="/news" className="hover:text-white transition">TIN TỨC</Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-white bg-lime-600 px-3 py-1 rounded-full text-[10px]">MỚI NHẤT</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black mb-4 drop-shadow-lg">
            Tin Tức <span className="text-lime-400">Cập Nhật</span>
          </h1>
          <p className="text-gray-200 text-lg max-w-xl leading-relaxed drop-shadow-md">
            Khám phá những thông báo mới nhất, mẹo vặt sống xanh và các bài viết chia sẻ kiến thức tích cực từ đội ngũ Green Store.
          </p>
        </div>
      </section>

      {/* Breadcrumb phụ & Thống kê */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-500">
             <Bookmark className="w-4 h-4 text-lime-600" />
             <span>Hiện có <span className="font-bold text-gray-800">{posts.length}</span> bài viết được chia sẻ</span>
          </div>
          <div className="hidden md:flex gap-4">
             <span className="text-gray-400 italic">Sắp xếp theo: Mới nhất</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* List bài viết chính (2/3) */}
            <div className="lg:col-span-2 space-y-10">
              {sorted.map((post) => (
                <article key={post.slug} className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row">
                  <div className="md:w-64 h-52 md:h-auto flex-shrink-0 overflow-hidden relative">
                    <img 
                      src={post.image} 
                      alt={post.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                    <div className="absolute top-4 left-4">
                       <span className="bg-lime-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase">Tin mới</span>
                    </div>
                  </div>
                  
                  <div className="p-6 md:p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-4 text-xs text-gray-400 mb-3 font-medium uppercase tracking-wider">
                       <div className="flex items-center gap-1">
                         <Calendar className="w-3.5 h-3.5" />
                         {new Date(post.date).toLocaleDateString('vi-VN')}
                       </div>
                       <span className="w-1 h-1 bg-gray-300 rounded-full" />
                       <div className="flex items-center gap-1">
                         <Clock className="w-3.5 h-3.5" />
                         4 phút đọc
                       </div>
                    </div>
                    
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 group-hover:text-lime-600 transition">
                      <Link href={`/news/${post.slug}`}>{post.title}</Link>
                    </h2>
                    
                    <p className="text-gray-600 text-sm md:text-base mb-6 line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>
                    
                    <Link 
                      href={`/news/${post.slug}`} 
                      className="text-lime-600 font-bold text-sm flex items-center gap-2 group/btn"
                    >
                      ĐỌC TIẾP <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {/* Sidebar (1/3) */}
            <aside className="space-y-8">
              {/* Bài viết phổ biến */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 text-lg mb-6 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-lime-500 rounded-full" />
                  Bài viết nổi bật
                </h3>
                <div className="space-y-6">
                  {sorted.slice(0, 4).map((p) => (
                    <div key={p.slug} className="group/item flex gap-4">
                      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                        <img src={p.image} className="w-full h-full object-cover group-hover/item:scale-110 transition" />
                      </div>
                      <div className="flex flex-col justify-center">
                        <Link href={`/news/${p.slug}`} className="text-sm font-bold text-gray-800 line-clamp-2 group-hover/item:text-lime-600 transition leading-snug">
                          {p.title}
                        </Link>
                        <span className="text-[10px] text-gray-400 mt-1 uppercase">{new Date(p.date).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Danh mục */}
              <div className="bg-lime-900 p-8 rounded-3xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 opacity-10 translate-x-1/4 -translate-y-1/4">
                  <Bookmark className="w-32 h-32" />
                </div>
                <h3 className="font-bold text-lg mb-6 relative z-10">Danh mục chuyên đề</h3>
                <ul className="space-y-3 relative z-10">
                  {['Tin tức sự kiện', 'Mẹo vặt hữu cơ', 'Chế độ dinh dưỡng', 'Thông báo cửa hàng'].map((cat, i) => (
                    <li key={i}>
                      <Link href="/news" className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition group">
                        <span className="text-sm font-medium">{cat}</span>
                        <ChevronRight className="w-4 h-4 text-lime-400 group-hover:translate-x-1 transition" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

          </div>
        </div>
      </section>
    </main>
  );
}

export default function LatestNewsPage() {
  return (
    // Bao bọc trực tiếp ở cấp độ Page để Next.js tách biệt quá trình render tĩnh
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-600"></div>
      </div>
    }>
      <LatestNewsContent />
    </Suspense>
  );
}