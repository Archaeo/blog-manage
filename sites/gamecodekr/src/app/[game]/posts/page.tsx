import { notFound } from "next/navigation";
import { getGameBySlug, getAllGameSlugs } from "@/lib/games";
import { getPostsByGame } from "@/lib/posts";
import { generateMetadata as genSeoMeta, createSiteConfig } from "@blog-manage/shared-seo";
import { PostCard } from "@/components/PostCard";
import type { Metadata } from "next";

const siteConfig = createSiteConfig({
  siteName: "GameCodeKR",
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://gamecodekr.pages.dev",
});

export function generateStaticParams() {
  return getAllGameSlugs().map((game) => ({ game }));
}

export function generateMetadata({
  params,
}: {
  params: { game: string };
}): Metadata {
  const game = getGameBySlug(params.game);
  if (!game) return {};
  const seo = genSeoMeta(siteConfig, {
    title: `${game.title} 블로그 - 분석, 가이드, 패치 요약 | GameCodeKR`,
    description: `${game.title}(${game.titleEn}) 코드 분석, 티어 분석, 패치 요약, 초보자 가이드를 확인하세요.`,
    keywords: [
      `${game.title} 가이드`,
      `${game.title} 분석`,
      `${game.title} 패치`,
    ],
    path: `/${params.game}/posts`,
  });
  return seo as Metadata;
}

export default function PostListPage({
  params,
}: {
  params: { game: string };
}) {
  const game = getGameBySlug(params.game);
  if (!game) notFound();

  const posts = getPostsByGame(params.game);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="flex items-center gap-3">
        <img
          src={game.imageUrl}
          alt={game.title}
          className="h-10 w-10 rounded-lg object-cover"
        />
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {game.title} 블로그
          </h1>
          <p className="text-xs text-slate-400">
            분석, 가이드, 패치 요약
          </p>
        </div>
      </div>

      {posts.length > 0 ? (
        <div className="mt-6 space-y-3">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-400">아직 글이 없어요</p>
        </div>
      )}
    </div>
  );
}
