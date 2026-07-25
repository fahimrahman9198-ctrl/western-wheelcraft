import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface BlogPostFrontmatter {
  title: string;
  description: string;
  /** ISO date, YYYY-MM-DD */
  date: string;
  slug: string;
  keywords: string[];
  /** Optional path under /public, e.g. /images/blog/foo.jpg */
  ogImage?: string;
}

export interface BlogPost extends BlogPostFrontmatter {
  /** Markdown body without frontmatter */
  content: string;
  /** Estimated minutes to read, based on word count */
  readTime: number;
}

const POSTS_DIR = path.join(process.cwd(), 'content', 'blog');
const WORDS_PER_MINUTE = 220;

function assertFrontmatter(
  data: Record<string, unknown>,
  file: string
): asserts data is Record<string, unknown> & BlogPostFrontmatter {
  const missing = ['title', 'description', 'date', 'slug', 'keywords'].filter(
    (key) => data[key] === undefined || data[key] === null
  );
  if (missing.length > 0) {
    throw new Error(`Blog post ${file} is missing frontmatter fields: ${missing.join(', ')}`);
  }
  if (!Array.isArray(data.keywords)) {
    throw new Error(`Blog post ${file}: "keywords" must be a YAML list`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(data.date))) {
    throw new Error(`Blog post ${file}: "date" must be YYYY-MM-DD`);
  }
}

function parsePost(filename: string): BlogPost {
  const raw = fs.readFileSync(path.join(POSTS_DIR, filename), 'utf8');
  const { data, content } = matter(raw);
  // gray-matter parses unquoted YYYY-MM-DD frontmatter dates into Date objects
  if (data.date instanceof Date) {
    data.date = data.date.toISOString().slice(0, 10);
  }
  assertFrontmatter(data, filename);

  const wordCount = content.split(/\s+/).filter(Boolean).length;

  return {
    title: String(data.title),
    description: String(data.description),
    date: String(data.date),
    slug: String(data.slug),
    keywords: (data.keywords as unknown[]).map(String),
    ogImage: data.ogImage ? String(data.ogImage) : undefined,
    content,
    readTime: Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE)),
  };
}

/** All posts, newest first. */
export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((file) => file.endsWith('.md'))
    .map(parsePost)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return getAllPosts().find((post) => post.slug === slug);
}
