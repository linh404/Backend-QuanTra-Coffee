"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"   // hoặc useSession của NextAuth

export default function ReviewForm({ productId }: any) {
  const { user } = useAuth();            // thông tin người dùng đã đăng nhập
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")

  async function submitReview() {
    if (!user) {
      alert("Vui lòng đăng nhập!")
      return
    }

    await fetch("/api/products/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_id: productId,
        user_id: user.id,          // truyền id của user
        rating,
        comment,
        is_purchased: true,        // hoặc kiểm tra thực tế người dùng đã mua
        images: []                 // nếu có
      })
    })

    // …có thể đặt lại state / thông báo thành công
  }

  return (
    <div className="border rounded p-5 mt-6">
      <h3 className="font-semibold mb-3">
        Viết đánh giá
      </h3>

      <div className="flex text-2xl text-yellow-400">

        {[1,2,3,4,5].map(star =>(

          <span
            key={star}
            onClick={()=>setRating(star)}
            className="cursor-pointer"
          >
            {star <= rating ? "★" : "☆"}
          </span>

        ))}

      </div>

      <textarea
        value={comment}
        onChange={(e)=>setComment(e.target.value)}
        className="border w-full p-2 mt-3 rounded"
        placeholder="Chia sẻ cảm nhận..."
      />

      <button
        onClick={submitReview}
        className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
      >
        Gửi đánh giá
      </button>

    </div>
  )
}