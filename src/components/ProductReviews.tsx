// src/components/ProductReviews.tsx
"use client"
import { useState, useEffect } from 'react';
import Image from 'next/image';
import RatingSummary from './RatingSummary';
import ReviewFilter from './ReviewFilter';
import ReviewItem from './ReviewItem';

export default function ProductReviews({ productSlug, userId, isPurchased }: any) {
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [images, setImages] = useState<string[]>([]);
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({});
  const [ratingFilter, setRatingFilter] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch reviews and summary
  useEffect(() => {
    fetchSummary();
    fetchReviews();
  }, [productSlug, ratingFilter]);

  const fetchSummary = async () => {
    const res = await fetch(`/api/products/${productSlug}/review-summary`);
    const data = await res.json();
    setSummary(data);
  };

  const fetchReviews = async () => {
    setLoading(true);
    const url = ratingFilter
      ? `/api/products/${productSlug}/reviews?rating=${ratingFilter}`
      : `/api/products/${productSlug}/reviews`;
    const res = await fetch(url);
    const data = await res.json();
    setReviews(data);
    setLoading(false);
  };

  const handleSendReview = async () => {
    // Get product_id from slug for the POST request
    const productRes = await fetch(`/api/products/${productSlug}`);
    const productData = await productRes.json();
    const productId = productData.id;

    const response = await fetch('/api/products/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: productId,
        user_id: userId,
        rating: isPurchased ? rating : null,
        comment: comment,
        images: isPurchased ? images : [],
        is_purchased: isPurchased
      }),
    });
    if (response.ok) {
      alert("Cảm ơn bạn đã để lại đánh giá!");
      setComment('');
      setRating(5);
      setImages([]);
      fetchSummary(); // Refresh summary
      fetchReviews(); // Refresh reviews
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-3xl border border-emerald-100 shadow-sm">
      <h3 className="text-2xl font-black text-emerald-950 mb-6">Phản hồi khách hàng</h3>

      {/* RATING SUMMARY */}
      {Object.keys(summary).length > 0 && (
        <RatingSummary summary={summary} />
      )}

      {/* Gallery ảnh từ các đánh giá */}
      {reviews.some((r: any) => r.images?.length > 0) && (
        <div className="flex flex-wrap gap-2 mb-8">
          <h4 className="w-full text-sm font-bold mb-2">Tất cả hình ảnh:</h4>
          {reviews.flatMap((r: any) => r.images || []).map((img: string, idx: number) => (
            <img 
              key={idx} 
              src={img} 
              className="w-20 h-20 object-cover rounded-md border border-gray-200" 
              alt="Review" 
            />
          ))}
        </div>
      )}

      {/* REVIEW FILTER */}
      <ReviewFilter onChange={setRatingFilter} />

      {/* BOX VIẾT ĐÁNH GIÁ */}
      <div className="mb-10 p-4 bg-emerald-50/50 rounded-2xl mt-6">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Bạn thấy sản phẩm này thế nào?"
          className="w-full p-4 rounded-xl border-none focus:ring-2 focus:ring-emerald-500 mb-4"
          rows={3}
        />

        {isPurchased ? (
          /* GIAO DIỆN CHỦ ĐỘNG (ĐÃ MUA) */
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-emerald-800">Đánh giá:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setRating(star)} className={`text-xl ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}>★</button>
              ))}
            </div>
            <div className="text-xs text-gray-500 italic">✨ Bạn có thể đăng kèm hình ảnh thực tế sản phẩm.</div>
            <button onClick={handleSendReview} className="bg-emerald-900 text-white px-8 py-2 rounded-full font-bold hover:bg-emerald-800 self-start transition-all">Gửi đánh giá xác thực</button>
          </div>
        ) : (
          /* GIAO DIỆN BỊ ĐỘNG (CHƯA MUA) */
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Bạn chưa mua sản phẩm? Hãy để lại góp ý tại đây.</span>
            <button onClick={handleSendReview} className="border border-emerald-900 text-emerald-900 px-8 py-2 rounded-full font-bold hover:bg-emerald-100 transition-all">Gửi bình luận</button>
          </div>
        )}
      </div>

      {/* DANH SÁCH HIỂN THỊ */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-8">Đang tải đánh giá...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Chưa có đánh giá nào</div>
        ) : (
          reviews.map((review: any) => (
            <ReviewItem key={review.id} review={review} />
          ))
        )}
      </div>
    </div>
  );
}