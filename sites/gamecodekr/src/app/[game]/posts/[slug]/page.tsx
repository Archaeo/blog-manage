import { notFound } from "next/navigation";
import { getGameBySlug, getAllGameSlugs } from "@/lib/games";
import { getPost, getAllPostSlugs } from "@/lib/posts";
import { generateMetadata as genSeoMeta, createSiteConfig } from "@blog-manage/shared-seo";
import { PostTypeBadge } from "@/components/PostTypeBadge";
import { PostContent } from "@/components/PostContent";
import type { Metadata } from "next";

const siteConfig = createSiteConfig({
  siteName: "GameCodeKR",
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://gamecodekr.pages.dev",
});

export function generateStaticParams() {
  return getAllPostSlugs().map(({ game, slug }) => ({ game, slug }));
}

export function generateMetadata({
  params,
}: {
  params: { game: string; slug: string };
}): Metadata {
  const post = getPost(params.game, params.slug);
  if (!post) return {};
  const seo = genSeoMeta(siteConfig, {
    title: `${post.title} | GameCodeKR`,
    description: post.description,
    keywords: post.tags,
    path: `/${params.game}/posts/${params.slug}`,
  });
  return seo as Metadata;
}

export default function PostDetailPage({
  params,
}: {
  params: { game: string; slug: string };
}) {
  const game = getGameBySlug(params.game);
  if (!game) notFound();

  const post = getPost(params.game, params.slug);
  if (!post) notFound();

  const dateStr = new Date(post.date).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* 뒤로가기 */}
      <a
        href={`/${game.slug}/posts`}
        className="mb-4 inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600"
      >
        ← {game.title} 글 목록
      </a>

      {/* 헤더 */}
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2">
          <PostTypeBadge type={post.type} />
          <span className="text-[10px] text-slate-400">{dateStr}</span>
        </div>
        <h1 className="text-xl font-bold leading-tight text-slate-900">
          {post.title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{post.description}</p>
        {post.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] text-slate-500"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 본문 */}
      <PostContent source={post.content} />

      {/* 하단 네비게이션 */}
      <div className="mt-8 border-t border-slate-200 pt-4">
        <a
          href={`/${game.slug}/posts`}
          className="text-xs text-blue-600 hover:underline"
        >
          ← {game.title} 글 목록으로 돌아가기
        </a>
      </div>
    </div>
  );
}
