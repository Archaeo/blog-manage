import type { BlogPost } from "@/lib/types";
import { PostTypeBadge } from "./PostTypeBadge";

interface PostCardProps {
  post: Omit<BlogPost, "content">;
}

export function PostCard({ post }: PostCardProps) {
  const dateStr = new Date(post.date).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <a
      href={`/${post.game}/posts/${post.slug}`}
      className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="mb-2 flex items-center gap-2">
        <PostTypeBadge type={post.type} />
        <span className="text-[10px] text-slate-400">{dateStr}</span>
      </div>
      <h3 className="mb-1 text-sm font-bold text-slate-900">{post.title}</h3>
      <p className="text-xs leading-relaxed text-slate-500">
        {post.description}
      </p>
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
    </a>
  );
}
