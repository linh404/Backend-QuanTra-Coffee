import Link from "next/link"
import Image from "next/image"
import AnimatedCounter from "@/components/AnimatedCounter"

export const metadata = {
  title: "Hành trình Green Store | Tinh túy từ đất mẹ",
  description: "Khám phá câu chuyện đằng sau mỗi bữa ăn sạch tại Green Store. Hệ thống kiểm định 4 lớp, kết nối trực tiếp từ nông trại đến bàn ăn gia đình bạn.",
  // ... (giữ nguyên OpenGraph)
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white text-gray-800 font-sans selection:bg-emerald-100 selection:text-emerald-900">

      {/* ================= HERO: CẢM HỨNG & KHỞI ĐẦU ================= */}
      <section className="relative h-[85vh] flex items-center overflow-hidden bg-emerald-950">
        {/* Lớp nền ảnh mờ nghệ thuật */}
        <div className="absolute inset-0 opacity-40">
           <Image 
            src="https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?q=80&w=2070" 
            alt="Nature Background" 
            fill 
            className="object-cover scale-110 blur-[2px]"
           />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center text-white">
          <span className="text-emerald-400 font-mono tracking-[0.3em] text-xs md:text-sm uppercase mb-4 block animate-fade-in">
            Since 2024 • Authentic Organic
          </span>
          <h1 className="text-5xl md:text-8xl font-black leading-tight tracking-tighter mb-6">
            NƠI ĐẤT LÀNH <br/> 
            <span className="bg-gradient-to-b from-emerald-300 to-lime-300 bg-clip-text text-transparent">TẠO NÊN HẠNH PHÚC</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl font-light text-emerald-50/80 leading-relaxed">
            Green Store ra đời từ ước mơ mang những thức quà tinh túy nhất của nông nghiệp Việt, 
            vẹn nguyên hương vị sương sớm, đến tận tay những gia đình thành thị.
          </p>
          
          <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-6">
             <div className="flex items-center gap-3 text-sm font-medium border-r border-white/20 pr-6">
                <span className="w-2 h-2 bg-lime-400 rounded-full animate-ping"></span>
                Truy xuất nguồn gốc 100%
             </div>
             <div className="flex items-center gap-3 text-sm font-medium">
                Kiểm định 4 lớp độc lập
             </div>
          </div>
        </div>

        {/* Nút cuộn xuống dưới nhẹ nhàng */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
          <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent"></div>
        </div>
      </section>

      {/* ================= STATS: NHỮNG CON SỐ BIẾT NÓI ================= */}
      <section className="relative z-20 -mt-10 max-w-6xl mx-auto px-6">
        <div className="bg-white shadow-2xl rounded-[2rem] p-8 md:p-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center border border-gray-100">
          <div className="space-y-2">
            <div className="text-3xl md:text-5xl font-black text-emerald-900 leading-none">
              <AnimatedCounter value={745} />+
            </div>
            <div className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-widest">Nông dân canh tác</div>
          </div>

          <div className="space-y-2">
            <div className="text-3xl md:text-5xl font-black text-emerald-900 leading-none">
              <AnimatedCounter value={2480} />+
            </div>
            <div className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-widest">Hộ chăn nuôi sạch</div>
          </div>

          <div className="space-y-2">
            <div className="text-3xl md:text-5xl font-black text-emerald-900 leading-none">
              <AnimatedCounter value={3000} />+
            </div>
            <div className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-widest">Gia đình tin tưởng</div>
          </div>

          <div className="space-y-2">
            <div className="text-3xl md:text-5xl font-black text-lime-600 leading-none">4.8/5</div>
            <div className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-widest">Chỉ số hài lòng</div>
          </div>
        </div>
      </section>

      {/* ================= THE STORY SECTION (MỤC BẠN VỪA LÀM) ================= */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-24">
        <Image
          src="https://images.unsplash.com/photo-1762773302175-7583d34b79ab?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Green Store Farm"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-900/80 to-emerald-900/40" />

        <div className="relative z-10 max-w-6xl px-6 text-white w-full">
          <div className="max-w-3xl space-y-6">
            <span className="inline-block px-4 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-emerald-300 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase">
              Hành trình tận tâm
            </span>
            <h2 className="text-5xl md:text-7xl font-black leading-tight tracking-tight">
              Gói Ghém Chất lượng <br />
              <span className="italic font-serif font-light text-emerald-200">Gửi Trọn</span> Bữa Ăn Ngon
            </h2>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Timeline Line (Desktop) */}
            <div className="hidden md:block absolute top-10 left-0 w-full h-[1px] bg-emerald-500/20 z-0"></div>
            
            <div className="group relative z-10 bg-emerald-900/30 backdrop-blur-md p-6 rounded-2xl border border-white/5 hover:border-emerald-400/30 transition-all duration-500">
              <div className="text-emerald-400 font-mono text-2xl font-bold mb-4">05:00 AM</div>
              <h3 className="text-xl font-bold mb-3 text-white">Đánh thức Nông Trại</h3>
              <p className="text-emerald-50/70 leading-relaxed font-light italic">
                "Khi phố thị còn say giấc, đôi bàn tay người nông dân đã nhẹ nhàng hái những lá rau còn đọng sương mai, giữ trọn độ giòn và nhựa sống."
              </p>
            </div>

            <div className="group relative z-10 bg-emerald-900/30 backdrop-blur-md p-6 rounded-2xl border border-white/5 hover:border-emerald-400/30 transition-all duration-500">
              <div className="text-emerald-400 font-mono text-2xl font-bold mb-4">08:00 AM</div>
              <h3 className="text-xl font-bold mb-3 text-white">Chắt Lọc Tinh Túy</h3>
              <p className="text-emerald-50/70 leading-relaxed font-light">
                Hệ thống kiểm định 4 lớp nghiêm ngặt từ mẫu đất, nguồn nước đến dư lượng. Chỉ những gì hoàn hảo nhất mới được phép rời vườn.
              </p>
            </div>

            <div className="group relative z-10 bg-emerald-900/30 backdrop-blur-md p-6 rounded-2xl border border-white/5 hover:border-emerald-400/30 transition-all duration-500">
              <div className="text-emerald-400 font-mono text-sm font-bold mb-4 italic">SUNSET DELIVERY</div>
              <h3 className="text-xl font-bold mb-3 text-white">Ấm Áp Gian Bếp</h3>
              <p className="text-emerald-50/70 leading-relaxed font-light">
                Giao hàng nhanh từ 24-48h. Chúng tôi không chỉ giao thực phẩm, chúng tôi giao cả sự an tâm và sức khỏe vào tận gian bếp của bạn.
              </p>
            </div>
          </div>

          <div className="mt-20 pt-10 border-t border-white/10 flex flex-wrap items-center gap-8">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-14 h-14 rounded-full border-4 border-emerald-950 overflow-hidden shadow-2xl">
                  <img src={`https://i.pravatar.cc/150?u=greenstore${i}`} alt="Happy Customer" className="w-full h-full object-cover" />
                </div>
              ))}
              <div className="w-14 h-14 rounded-full border-4 border-emerald-950 bg-emerald-500 flex items-center justify-center text-xs font-bold">+3k</div>
            </div>
            <div className="max-w-xs">
              <p className="text-emerald-200 font-medium">Cộng đồng sống xanh</p>
              <p className="text-xs text-emerald-50/50">Được đồng hành cùng 3.000+ bữa cơm gia đình mỗi ngày.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SCIENCE: HỆ THỐNG KIỂM ĐỊNH (KIẾN THỨC) */}
      <section className="py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-20 items-center">
          <div className="space-y-10">
            <div>
              <h2 className="text-emerald-600 font-bold tracking-widest text-xs uppercase mb-3">Kỹ thuật & Hệ thống</h2>
              <h3 className="text-4xl md:text-6xl font-black text-emerald-950 leading-[1.1]">
                Nông nghiệp từ <span className="text-lime-600">tư duy khoa học</span>
              </h3>
            </div>
            <div className="space-y-6">
              {[
                { t: "Sàng lọc vùng nguyên liệu", d: "Kiểm tra dư lượng kim loại nặng trong đất và nguồn nước ngầm." },
                { t: "Canh tác không hóa chất", d: "Ưu tiên vi sinh hữu cơ, nói không với thuốc trừ sâu độc hại." },
                { t: "Kiểm định Lab định kỳ", d: "Gửi mẫu kiểm tra tại các trung tâm độc lập mỗi tuần." },
                { t: "Truy xuất nguồn gốc QR", d: "Minh bạch mọi công đoạn từ gieo hạt đến khi đóng gói." }
              ].map((item, i) => (
                <div key={i} className="flex gap-6 group">
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold group-hover:bg-emerald-600 group-hover:text-white transition-all">0{i+1}</div>
                  <div>
                    <h4 className="font-bold text-lg text-emerald-900 mb-1">{item.t}</h4>
                    <p className="text-gray-500 leading-relaxed">{item.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
             <div className="rounded-[3rem] overflow-hidden shadow-2xl rotate-2">
                <Image src="https://images.unsplash.com/photo-1592419044706-39796d40f98c?q=80&w=2000" alt="Lab Test" width={600} height={800} className="object-cover h-[650px]" />
             </div>
             <div className="absolute -bottom-10 -left-10 bg-lime-400 p-10 rounded-[2.5rem] shadow-2xl max-w-xs -rotate-3">
                <p className="text-emerald-950 font-serif italic text-xl leading-snug">"Chúng tôi chọn lọc kỹ càng để hợp tác với những trang trại đáng tin cậy."</p>
             </div>
          </div>
        </div>
      </section>

      {/* 5. HUMAN: CHÂN DUNG NGƯỜI GIEO MẦM (TRẢI NGHIỆM) */}
      <section className="py-32 bg-emerald-950 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row gap-20 items-center">
          <div className="w-full md:w-1/2 relative">
            <div className="aspect-[4/5] rounded-[3rem] overflow-hidden border-8 border-emerald-900/50 shadow-inner">
              <Image src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?q=80&w=2000" alt="Farmer" fill className="object-cover" />
            </div>
          </div>
          <div className="w-full md:w-1/2 space-y-8">
            <h2 className="text-5xl md:text-7xl font-black leading-none italic opacity-20 absolute -top-10 left-0 hidden md:block">HUMANITY</h2>
            <div className="relative z-10 space-y-6">
              <h3 className="text-4xl md:text-5xl font-black">Sự tử tế <br/><span className="text-lime-400 underline decoration-white/20 underline-offset-8">trong từng nhịp thở</span></h3>
              <p className="text-emerald-100/70 text-lg font-light leading-relaxed">
                Tại Green Store, mỗi mầm xanh là một lời hứa. Chúng tôi thực hiện "Giao kèo công bằng" để người nông dân chỉ cần tập trung vào chất lượng, phần còn lại hãy để chúng tôi lo.
              </p>
              <div className="p-8 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 italic font-serif text-emerald-200">
                "Mỗi bó rau bạn chọn là một bước nuôi dưỡng nông nghiệp phát triển."
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CALL TO ACTION: CHỐT HẠ ================= */}
      <section className="relative bg-emerald-950 text-white overflow-hidden">
  {/* Lớp nền ảnh mờ nghệ thuật - TẠO CẢM XỨNG BỮA ĂN GIA ĐÌNH ẤM CÚNG */}
  <div className="absolute inset-0 opacity-15">
    <Image 
      src="https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=2070" // Ảnh bữa ăn gia đình hoặc nguyên liệu tươi
      alt="Bữa ăn gia đình ấm cúng" 
      fill 
      className="object-cover scale-105 blur-[2px]"
    />
  </div>

  <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 md:py-32 grid md:grid-cols-2 gap-16 items-center">
    
    {/* CỘT 1: NỘI DUNG DẪN DẮT (STORYTELLING CTA) */}
    <div className="space-y-10 animate-fade-in-up">
      <div className="space-y-4">
        <span className="inline-block px-4 py-1 bg-lime-500/20 border border-lime-400/30 rounded-full text-lime-300 text-xs font-bold tracking-[0.2em] uppercase">
          CHĂM SÓC GIA ĐÌNH BẠN
        </span>
        <h2 className="text-5xl md:text-6xl font-black leading-tight tracking-tighter">
          Bữa Tối Tươi Ngon <br/> 
          <span className="bg-gradient-to-r from-white via-emerald-100 to-lime-200 bg-clip-text text-transparent">Chỉ Cách Bạn Một Click</span>
        </h2>
      </div>

      <p className="text-emerald-100/80 text-lg md:text-xl font-light leading-relaxed max-w-2xl">
        Đừng để sự bận rộn làm ảnh hưởng đến sức khỏe của người thân yêu. 
        Ghé thăm cửa hàng trực tuyến của Green Store, nơi bạn tìm thấy sự an tâm tuyệt đối 
        trong mỗi nguyên liệu sạch, minh bạch nguồn gốc và đầy đủ dinh dưỡng nhất.
      </p>

      {/* Danh sách lợi ích ngắn gọn với Icon */}
      <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/10">
        <div className="flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-xl bg-emerald-800 flex items-center justify-center text-lime-400 border border-emerald-700 group-hover:bg-emerald-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold">Nguồn Gốc Minh Bạch</h4>
            <p className="text-xs text-emerald-100/60">Truy xuất 100% nông trại.</p>
          </div>
        </div>
        <div className="flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-xl bg-emerald-800 flex items-center justify-center text-lime-400 border border-emerald-700 group-hover:bg-emerald-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold">Giao Hàng Nhanh 24h</h4>
            <p className="text-xs text-emerald-100/60">Đảm bảo độ tươi ngon nhất.</p>
          </div>
        </div>
      </div>

      <div className="pt-6">
        <Link
          href="/products"
          className="group relative inline-flex items-center gap-3 bg-white text-emerald-950 font-extrabold px-12 py-5 rounded-full shadow-[0_15px_40px_rgba(255,255,255,0.15)] hover:scale-105 transition-all duration-300"
        >
          SẮM NGAY CHO BỮA TỐI
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
    </div>

    {/* CỘT 2: HÌNH ẢNH SẢN PHẨM SẮC NÉT (VISUAL PROOF) */}
    <div className="relative group aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl animate-fade-in-right delay-200">
      <Image
        src="https://images.unsplash.com/photo-1653819499129-f09fccfd5ef0?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" // Ảnh rổ rau củ/trái cây tươi ngon, đầy màu sắc
        alt="Nông sản sạch Green Store"
        fill
        className="object-cover group-hover:scale-105 transition-transform duration-700"
      />
      
      {/* Thẻ giá/chứng nhận nổi bật */}
      <div className="absolute top-8 right-8 bg-lime-400 text-emerald-950 font-black p-5 rounded-3xl rotate-12 shadow-lg group-hover:rotate-0 transition-transform">
        <div className="text-3xl">100%</div>
        <div className="text-[10px] uppercase tracking-widest opacity-80">Organic</div>
      </div>
      
      {/* Lớp phủ Gradient nhẹ phía dưới để chữ dễ đọc (nếu có) */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent"></div>
      
      {/* Tên sản phẩm/gói hàng mờ mờ nghệ thuật */}
      <div className="absolute bottom-6 left-8 text-white/90">
        <p className="text-sm font-light">Gợi ý cho bạn:</p>
        <p className="text-xl font-bold">Combo Rau Củ "Bữa Ăn Hạnh Phúc"</p>
      </div>
    </div>
    </div>
    {/* Họa tiết trang trí mặt sau nhẹ nhàng hơn */}
    <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-lime-900 rounded-full blur-[120px] opacity-30 -mr-64 -mb-64"></div>
    <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-emerald-800 rounded-full blur-[100px] opacity-20 -ml-32 -mt-32"></div>
    </section>

      {/* Structured Data Scripts giữ nguyên */}
      {/* ... */}
    </main>
  )
}