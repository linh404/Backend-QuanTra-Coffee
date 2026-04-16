import Link from 'next/link';
import { posts } from '@/lib/news-data';

interface Props {
  params: { slug: string };
}

export default function NewsDetail({ params }: Props) {
  const post = posts.find((p) => p.slug === params.slug);
  if (!post) {
    return (
      <main className="min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl text-gray-500 font-bold">Bài viết không tìm thấy</h2>
          <p className="text-gray-500 mt-4">Bài viết bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <div className="mt-6">
            <Link href="/news" className="text-lime-600">Quay lại danh sách tin</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <section className="bg-white py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-sm text-gray-500 mb-2">{new Date(post.date).toLocaleDateString('vi-VN')}</div>
          <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
          <div className="mb-6">
            <img src={post.image} alt={post.title} className="w-full h-64 object-cover rounded" />
          </div>

          <article className="prose prose-lg max-w-none text-gray-800" dangerouslySetInnerHTML={{ __html: post.content }} />

          <div className="mt-8">
            <Link href="/news" className="text-lime-600 font-semibold">← Quay lại danh sách tin</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
