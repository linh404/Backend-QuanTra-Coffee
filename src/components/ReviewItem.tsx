export default function ReviewItem({ review }: any) {

  return (
    <div className="border-b py-6">

      <div className="flex items-center gap-3">

        <div className="font-semibold">
          {review.name}
        </div>

        {review.is_purchased && (
          <span className="text-green-600 text-xs">
            Đã mua hàng
          </span>
        )}

      </div>

      <div className="text-yellow-400">
        {"★★★★★".slice(0, review.rating)}
      </div>

      <p className="mt-2 text-gray-700">
        {review.comment}
      </p>

      {review.images?.length > 0 && (

        <div className="flex gap-2 mt-3">

          {review.images.map((img: string, i: number) => (

            <img
              key={i}
              src={img}
              className="w-20 h-20 object-cover rounded"
            />

          ))}

        </div>

      )}

      <div className="text-gray-400 text-sm mt-2">
        {new Date(review.created_at).toLocaleDateString()}
      </div>

    </div>
  )
}