"use client"

export default function ReviewFilter({ onChange }: any) {

  const filters = [
    { label: "Tất cả", value: null },
    { label: "5 Sao", value: 5 },
    { label: "4 Sao", value: 4 },
    { label: "3 Sao", value: 3 },
    { label: "2 Sao", value: 2 },
    { label: "1 Sao", value: 1 }
  ]

  return (
    <div className="flex flex-wrap gap-3 mt-6">

      {filters.map((f, i) => (

        <button
          key={i}
          onClick={() => onChange(f.value)}
          className="border px-4 py-2 rounded hover:bg-gray-100"
        >
          {f.label}
        </button>

      ))}

    </div>
  )
}