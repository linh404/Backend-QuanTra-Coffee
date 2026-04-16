'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'

// Import bản đồ không SSR để tránh lỗi window is not defined
const TraceabilityMap = dynamic(() => import('@/components/TraceabilityMap'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-100 animate-pulse flex items-center justify-center">Đang tải bản đồ...</div>
})

export default function TraceabilityPage() {
  const params = useParams()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // State mới để quản lý ảnh đang được phóng to
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const response = await fetch(`/api/products/${params.slug}`)
        const data = await response.json()
        if (data.success) setProduct(data.data)
      } catch (error) {
        console.error("Lỗi lấy dữ liệu:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchProductData()
  }, [params.slug])

  if (loading) return <div className="p-10 text-center">Đang xác thực mã nguồn gốc...</div>
  if (!product) return <div className="p-10 text-center">Không tìm thấy thông tin sản phẩm.</div>

  // Đường dẫn trỏ thẳng tới trang truy xuất nguồn gốc
  const url = `${window.location.origin}/products/${params.slug}/traceability`

  // Mảng chứa các hình ảnh chứng chỉ bạn đã tải lên (đảm bảo file đã nằm trong thư mục /public)
  const certificateImages = [
    '/vietgap_1.jpg',
    '/vietgap_2.png',
    '/vietgap_3.jpeg',
    '/vietgap_4.jpg'
  ]

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen pb-10 shadow-inner relative">
      {/* Header Profile */}
      <div className="bg-[#527a2d] text-white p-8 text-center rounded-b-[3rem] shadow-xl">
        <div className="w-20 h-20 bg-white rounded-full mx-auto mb-4 p-1 shadow-md">
          <img src={product.imageUrl || '/logo.jpeg'} alt="Product" className="w-full h-full object-cover rounded-full" />
        </div>
        <h1 className="text-xl font-bold uppercase tracking-wider">Chứng nhận Nguồn gốc</h1>
        <p className="text-sm opacity-90 mt-1">{product.name}</p>
      </div>

      <div className="px-5 -mt-6 space-y-5">
        {/* Nhà sản xuất & Cam kết chất lượng */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-50 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-6 bg-[#527a2d] rounded-full"></span>
            <h2 className="text-[#527a2d] font-bold text-lg">Thông tin nơi sản xuất</h2>
          </div>

          <div className="space-y-4">
            {/* Tên đơn vị */}
            <div>
              <p className="text-gray-900 font-bold text-base leading-tight">
                {product.producer_info || "Hợp tác xã Nông nghiệp Công nghệ cao Green Store"}
              </p>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Vùng trồng đạt chuẩn GlobalGAP tại Thái Nguyên
              </p>
            </div>

            {/* Nội dung thuyết phục */}
            <div className="bg-green-50/50 p-4 rounded-xl border border-green-100/50">
              <p className="text-sm text-gray-700 leading-relaxed">
                Sản phẩm <strong>{product.name}</strong> được nuôi trồng dựa trên sự kết hợp giữa 
                <span className="text-[#527a2d] font-semibold"> công nghệ nông nghiệp thông minh</span> và 
                phương thức canh tác hữu cơ truyền thống. Chúng tôi cam kết:
              </p>
              
              <ul className="mt-3 space-y-2">
                <li className="flex items-start gap-2 text-xs text-gray-600">
                  <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Không sử dụng thuốc trừ sâu hóa học và chất kích thích tăng trưởng.</span>
                </li>
                <li className="flex items-start gap-2 text-xs text-gray-600">
                  <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Nguồn nước tưới được kiểm định độ sạch định kỳ, đảm bảo an toàn tuyệt đối.</span>
                </li>
                <li className="flex items-start gap-2 text-xs text-gray-600">
                  <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Quy trình thu hoạch và đóng gói khép kín trong vòng 24h để giữ trọn độ tươi ngon.</span>
                </li>
              </ul>
            </div>

            {/* Thông điệp cuối */}
            <p className="text-[11px] text-gray-400 italic text-center">
              "Mỗi sản phẩm đến tay bạn là cả tâm huyết của người nông dân Green Store vì sức khỏe cộng đồng."
            </p>
          </div>
        </div>

        {/* Bản đồ Farm */}
        <div className="bg-white p-2 rounded-2xl shadow-sm border h-64 overflow-hidden relative">
          <TraceabilityMap 
            lat={Number(product.origin_lat) || 21.585} 
            lng={Number(product.origin_lng) || 105.806} 
            label={`Vùng trồng ${product.name}`} 
          />
        </div>

        {/* Chứng chỉ */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-green-50">
          <h2 className="text-[#527a2d] font-bold mb-4">Chứng chỉ & Tiêu chuẩn</h2>
          
          {/* Huy hiệu Text */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {(product.certificates?.length > 0 ? product.certificates : ['VIETGAP', 'GLOBAL GAP']).map((cert: string, i: number) => (
              <div key={i} className="flex items-center gap-2 p-3 bg-green-50 rounded-xl border border-green-100">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.64.3 1.241.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                </svg>
                <span className="text-xs font-bold text-green-800 uppercase">{cert}</span>
              </div>
            ))}
          </div>

          {/* Hiển thị hình ảnh chứng chỉ (Có thể click) */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            {certificateImages.map((src, index) => (
              <div 
                key={index} 
                className="overflow-hidden rounded-xl border border-green-100 shadow-sm cursor-zoom-in hover:opacity-90 transition-opacity"
                onClick={() => setSelectedImage(src)} // Khi bấm vào thì set ảnh được chọn
              >
                <img 
                  src={src} 
                  alt={`Giấy chứng nhận ${index + 1}`} 
                  className="w-full h-auto object-cover aspect-[3/4]"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>

        <Link 
          href={url}
          className="block w-full text-center py-4 bg-[#527a2d] text-white rounded-xl font-bold shadow-lg shadow-green-200"
        >
          Quay lại trang truy xuất nguồn gốc
        </Link>
      </div>

      {/* --- Cửa sổ phóng to ảnh (Modal/Lightbox) --- */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn"
          onClick={() => setSelectedImage(null)} // Bấm ra ngoài để đóng
        >
          {/* Nút đóng */}
          <button className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/80">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {/* Ảnh được phóng to */}
          <div className="relative max-w-full max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <img 
              src={selectedImage} 
              alt="Chứng chỉ phóng to" 
              className="w-auto h-auto max-w-full max-h-[90vh] rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}
      {/* ------------------------------------------- */}
    </div>
  )
}