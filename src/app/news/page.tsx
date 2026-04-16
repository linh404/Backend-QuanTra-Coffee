
import Link from 'next/link';
import { posts } from '@/lib/news-data';
import { Calendar, Clock, ArrowRight, ChevronRight } from 'lucide-react'; // Cần cài lucide-react

export const metadata = {
  title: 'Blog Sống Xanh - Green Store',
  description: 'Cập nhật kiến thức hữu cơ, mẹo vặt sống xanh và câu chuyện cảm hứng từ Green Store',
};

export default function NewsPage() {
  // Giả định bài viết đầu tiên là bài nổi bật
  const featuredPost = posts[0];
  const regularPosts = posts.slice(1);

  return (
    <main className="min-h-screen bg-gray-50/50 pb-20">
      {/* Header Section */}
      <section className="relative py-24 md:py-32 text-white overflow-hidden bg-gray-900">
  {/* 1. Lớp hình ảnh nền: Tăng opacity lên để nhìn rõ hình (ví dụ: 0.5 hoặc 0.6) */}
  <div 
    className="absolute inset-0 z-0 opacity-60 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1730312382825-40e51cedb11e?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }}
  />

  {/* 2. Lớp Overlay Gradient: Giúp che bớt một phần ảnh để chữ trắng luôn dễ đọc */}
  <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

  {/* 3. Nội dung */}
  <div className="max-w-7xl mx-auto px-4 relative z-20">
    <div className="flex items-center gap-2 text-lime-400 text-sm mb-6 font-semibold tracking-wide">
      <Link href="/" className="hover:text-white transition-colors">TRANG CHỦ</Link>
      <ChevronRight className="w-4 h-4 text-gray-400" />
      <span className="text-white bg-lime-600/80 px-3 py-1 rounded-full text-[10px]">BLOG SỐNG XANH</span>
    </div>
    
    <div className="max-w-3xl">
      <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight drop-shadow-lg">
        Cùng Green Store <br />
        <span className="text-lime-400">Sống Khỏe</span> Mỗi Ngày
      </h1>
      <p className="text-gray-200 text-lg md:text-xl max-w-2xl leading-relaxed mb-8 drop-shadow-md">
        Nơi chia sẻ những kiến thức bổ ích về thực phẩm hữu cơ, mẹo chăm sóc gia đình và những câu chuyện tích cực về môi trường.
      </p>
      
      {/* Thêm nút kêu gọi hành động để tăng tính chuyên nghiệp */}
      <div className="flex flex-wrap gap-4">
        <button className="bg-lime-600 hover:bg-lime-700 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg hover:shadow-lime-500/50">
          Khám phá ngay
        </button>
      </div>
    </div>
  </div>
</section>

      <div className="max-w-7xl mx-auto px-4 -mt-10 relative z-20">
        {/* Featured Post - Bài viết nổi bật */}
        {featuredPost && (
          <article className="bg-white rounded-3xl shadow-xl overflow-hidden mb-16 border border-gray-100 group">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="h-64 lg:h-[450px] overflow-hidden">
                <img 
                  src={featuredPost.image} 
                  alt={featuredPost.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                />
              </div>
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <span className="inline-block px-3 py-1 bg-lime-100 text-lime-700 text-xs font-bold rounded-full mb-6 w-fit">
                  BÀI VIẾT NỔI BẬT
                </span>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 group-hover:text-lime-600 transition">
                  <Link href={`/news/${featuredPost.slug}`}>{featuredPost.title}</Link>
                </h2>
                <p className="text-gray-600 text-lg mb-6 leading-relaxed line-clamp-3">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center gap-6 text-sm text-gray-500 mb-8">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(featuredPost.date).toLocaleDateString('vi-VN')}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    5 phút đọc
                  </div>
                </div>
                <Link 
                  href={`/news/${featuredPost.slug}`}
                  className="flex items-center gap-2 text-lime-600 font-bold hover:gap-4 transition-all"
                >
                  ĐỌC BÀI VIẾT <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </article>
        )}

        {/* Categories / Filter (Optional placeholder) */}
        <div className="flex flex-wrap gap-4 mb-10 border-b border-gray-200 pb-6">
          {['Tất cả', 'Dinh dưỡng', 'Mẹo vặt', 'Sống xanh', 'Thông báo'].map((cat, i) => (
            <button key={i} className={`px-5 py-2 rounded-full text-sm font-medium transition ${i === 0 ? 'bg-lime-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-lime-50 hover:text-lime-600 border'}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Regular Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {regularPosts.map((post) => (
            <article 
              key={post.slug} 
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
            >
              <Link href={`/news/${post.slug}`} className="block h-52 overflow-hidden relative">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                   <span className="px-3 py-1 bg-white/90 backdrop-blur shadow-sm text-lime-700 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                     Kinh nghiệm
                   </span>
                </div>
              </Link>
              
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center gap-3 text-[11px] text-gray-400 mb-3 uppercase tracking-widest font-semibold">
                  <span>{new Date(post.date).toLocaleDateString('vi-VN')}</span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full" />
                  <span>By Green Store</span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-lime-600 transition">
                  <Link href={`/news/${post.slug}`}>{post.title}</Link>
                </h3>
                
                <p className="text-sm text-gray-500 mb-6 line-clamp-3 leading-relaxed">
                  {post.excerpt}
                </p>
                
                <div className="mt-auto pt-4 border-t border-gray-50">
                  <Link 
                    href={`/news/${post.slug}`} 
                    className="text-sm font-bold text-gray-900 flex items-center gap-1 group/btn"
                  >
                    Xem chi tiết 
                    <ChevronRight className="w-4 h-4 text-lime-600 group-hover/btn:translate-x-1 transition" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="mt-20 bg-lime-50 rounded-[2rem] p-8 md:p-12 text-center border border-lime-100">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Nhận bản tin sống khỏe</h3>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto">
            Đăng ký để nhận những bài viết mới nhất về dinh dưỡng hữu cơ và các ưu đãi đặc quyền từ chúng tôi.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Email của bạn..." 
              className="flex-grow px-6 py-3 rounded-xl border-none focus:ring-2 focus:ring-lime-500 shadow-sm outline-none" 
            />
            <button className="bg-lime-600 hover:bg-lime-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg transition transform active:scale-95">
              ĐĂNG KÝ
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
