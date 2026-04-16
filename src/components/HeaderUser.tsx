/*import Image from "next/image"
import { useAuth } from "@/lib/auth-context"

export default function HeaderUser() {
  const { user } = useAuth()

  return (
    <div className="flex items-center gap-2">
      <Image
        src={user?.avatar || "/default-avatar.png"}
        alt="avatar"
        width={36}
        height={36}
        className="rounded-full object-cover"
      />

      <span className="text-green-600 font-semibold">
        {user?.name}
      </span>
    </div>
  )
}*/
'use client'

import Image from "next/image"
import { useAuth } from "@/lib/auth-context"

export default function HeaderUser() {
  const { user } = useAuth()

  if (!user) return null

  // Logic xử lý đường dẫn ảnh:
  const getAvatar = () => {
    if (!user.avatar) return "/default-avatar.png" // Ảnh mặc định nếu không có avatar nào
    
    // Nếu là link tuyệt đối (http...) thì giữ nguyên
    if (user.avatar.startsWith('http')) return user.avatar
    
    // Nếu là đường dẫn tương đối (uploads/...), thêm dấu / ở đầu để Next.js hiểu là từ thư mục public
    return user.avatar.startsWith('/') ? user.avatar : `/${user.avatar}`
  }

  return (
    <div className="flex items-center gap-2 px-2 py-1 bg-white/50 backdrop-blur-sm rounded-full border border-green-100 shadow-sm">
      <div className="relative w-9 h-9 overflow-hidden rounded-full border-2 border-white">
        <Image
          src={getAvatar()}
          alt="avatar"
          fill
          sizes="36px"
          className="object-cover"
          // Quan trọng: Nếu ảnh lỗi thì tự động chuyển về ảnh mặc định
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/default-avatar.png";
          }}
        />
      </div>

      <span className="text-green-700 font-bold text-sm hidden sm:block">
        {user.name}
      </span>
    </div>
  )
}
