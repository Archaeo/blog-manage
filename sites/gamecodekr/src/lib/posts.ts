import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { BlogPost, PostType } from "./types";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

export function getAllPosts(): Omit<BlogPost, "content">[] {
  const posts: Omit<BlogPost, "content">[] = [];

  if (!fs.existsSync(POSTS_DIR)) return posts;

  const gameDirs = fs.readdirSync(POSTS_DIR).filter((f) => {
    return fs.statSync(path.join(POSTS_DIR, f)).isDirectory();
  });

  for (const gameSlug of gameDirs) {
    const gameDir = path.join(POSTS_DIR, gameSlug);
    const files = fs.readdirSync(gameDir).filter((f) => f.endsWith(".mdx"));

    for (const file of files) {
      const slug = file.replace(/\.mdx$/, "");
      const filePath = path.join(gameDir, file);
      const raw = fs.readFileSync(filePath, "utf-8");
      const { data } = matter(raw);

      posts.push({
        slug,
        title: data.title ?? "",
        date: data.date ?? "",
        game: data.game ?? gameSlug,
        type: (data.type as PostType) ?? "guide",
        tags: data.tags ?? [],
        description: data.description ?? "",
      });
    }
  }

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getPostsByGame(gameSlug: string): Omit<BlogPost, "content">[] {
  return getAllPosts().filter((p) => p.game === gameSlug);
}

export function getPost(gameSlug: string, slug: string): BlogPost | null {
  const filePath = path.join(POSTS_DIR, gameSlug, `${slug}.mdx`);

  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  return {
    slug,
    title: data.title ?? "",
    date: data.date ?? "",
    game: data.game ?? gameSlug,
    type: (data.type as PostType) ?? "guide",
    tags: data.tags ?? [],
    description: data.description ?? "",
    content,
  };
}

export function getAllPostSlugs(): { game: string; slug: string }[] {
  return getAllPosts().map((p) => ({ game: p.game, slug: p.slug }));
}

export function getGamesWithPosts(): string[] {
  if (!fs.existsSync(POSTS_DIR)) return [];

  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => {
      const dir = path.join(POSTS_DIR, f);
      if (!fs.statSync(dir).isDirectory()) return false;
      const files = fs.readdirSync(dir).filter((ff) => ff.endsWith(".mdx"));
      return files.length > 0;
    });
}
