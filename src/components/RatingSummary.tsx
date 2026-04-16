"use client"

export default function RatingSummary({ summary }: any) {
  const ratings = [5, 4, 3, 2, 1];
  
  return (
  <div className="flex flex-col md:flex-row border border-emerald-100 rounded-2xl p-6 mb-6 gap-8 bg-emerald-50/30">
    {/* Cột trái: Điểm trung bình - Đổi từ text-orange-500 sang text-[#527a2d] */}
    <div className="flex flex-col items-center justify-center md:border-r border-emerald-100 pr-8">
      <div className="text-5xl font-black text-[#527a2d] flex items-center gap-2">
        {summary.average} <span className="text-2xl text-yellow-400">★</span>
      </div>
      <div className="text-[#527a2d] font-bold mt-2 uppercase text-xs tracking-wider">
        Đánh giá trung bình
      </div>
    </div>

    {/* Cột phải: Thanh tỉ lệ - Đổi bg-red-500 sang bg-[#6a9739] */}
    <div className="flex-1 space-y-3">
      {ratings.map((star) => {
        const starData = summary.counts?.find((c: any) => Number(c.rating) === star);
        const count = starData ? parseInt(starData.count) : 0;
        const percentage = summary.total > 0 ? Math.round((count / summary.total) * 100) : 0;

        return (
          <div key={star} className="flex items-center gap-4 text-sm font-medium">
            <div className="flex items-center gap-1 w-8">
              <span className="text-gray-700">{star}</span>
              <span className="text-yellow-400">★</span>
            </div>
            
            {/* Thanh Progress Bar màu xanh */}
            <div className="flex-1 h-2.5 bg-gray-200 rounded-full relative overflow-hidden">
              <div 
                className="absolute left-0 top-0 h-full bg-[#6a9739] rounded-full transition-all duration-700 ease-out"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            
            <div className="w-28 text-right">
              <span className="text-[#527a2d] font-bold">{percentage}%</span>
              <span className="text-gray-400 text-xs ml-1">({count})</span>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);
}