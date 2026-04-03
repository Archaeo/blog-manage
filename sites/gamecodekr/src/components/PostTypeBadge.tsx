import type { PostType } from "@/lib/types";

interface PostTypeBadgeProps {
  type: PostType;
}

const TYPE_CONFIG: Record<PostType, { label: string; bgColor: string; textColor: string }> = {
  "code-analysis": {
    label: "코드 분석",
    bgColor: "bg-blue-100",
    textColor: "text-blue-700",
  },
  "tier-analysis": {
    label: "티어 분석",
    bgColor: "bg-orange-100",
    textColor: "text-orange-700",
  },
  patch: {
    label: "패치 요약",
    bgColor: "bg-purple-100",
    textColor: "text-purple-700",
  },
  guide: {
    label: "가이드",
    bgColor: "bg-green-100",
    textColor: "text-green-700",
  },
};

export function PostTypeBadge({ type }: PostTypeBadgeProps) {
  const config = TYPE_CONFIG[type] ?? TYPE_CONFIG.guide;

  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${config.bgColor} ${config.textColor}`}
    >
      {config.label}
    </span>
  );
}
