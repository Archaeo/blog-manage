import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import "./post-content.css";

interface PostContentProps {
  source: string;
}

export async function PostContent({ source }: PostContentProps) {
  const { content } = await compileMDX({
    source,
    options: {
      parseFrontmatter: false,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
      },
    },
  });

  return (
    <article className="post-prose prose prose-sm prose-slate max-w-none">
      {content}
    </article>
  );
}
