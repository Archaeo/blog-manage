import { compileMDX } from "next-mdx-remote/rsc";

interface PostContentProps {
  source: string;
}

export async function PostContent({ source }: PostContentProps) {
  const { content } = await compileMDX({
    source,
    options: {
      parseFrontmatter: false,
    },
  });

  return (
    <article className="prose prose-sm prose-slate max-w-none">
      <style>{`
        .prose h2 {
          font-size: 1.125rem;
          font-weight: 700;
          color: #1e293b;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          padding-bottom: 0.375rem;
          border-bottom: 1px solid #e2e8f0;
        }
        .prose h3 {
          font-size: 0.975rem;
          font-weight: 600;
          color: #334155;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
        }
        .prose p {
          font-size: 0.875rem;
          line-height: 1.75;
          color: #475569;
          margin-bottom: 0.75rem;
        }
        .prose ul, .prose ol {
          font-size: 0.875rem;
          color: #475569;
          padding-left: 1.25rem;
          margin-bottom: 0.75rem;
        }
        .prose li {
          margin-bottom: 0.25rem;
        }
        .prose blockquote {
          border-left: 3px solid #3b82f6;
          background-color: #eff6ff;
          padding: 0.75rem 1rem;
          margin: 1rem 0;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          color: #1e40af;
        }
        .prose blockquote p {
          color: #1e40af;
          margin: 0;
        }
        .prose code {
          background-color: #f1f5f9;
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-size: 0.8125rem;
          color: #0f172a;
        }
        .prose strong {
          color: #1e293b;
        }
        .prose hr {
          border-color: #e2e8f0;
          margin: 1.5rem 0;
        }
      `}</style>
      {content}
    </article>
  );
}
