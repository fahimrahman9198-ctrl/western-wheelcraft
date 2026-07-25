import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getAllPosts, getPostBySlug } from '@/lib/blog';
import { FadeIn } from '@/components/ui/FadeIn';
import { Button } from '@/components/ui/Button';
import { JsonLd } from '@/components/seo/JsonLd';

const BASE_URL = 'https://westernwheelcraft.ca';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const post = getPostBySlug(params.slug);

  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      type: 'article',
      url: `${BASE_URL}/blog/${post.slug}`,
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      authors: ['Western Wheelcraft Ltd.'],
      ...(post.ogImage && { images: [{ url: post.ogImage, width: 1200, height: 630, alt: post.title }] }),
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      ...(post.ogImage && { images: [post.ogImage] }),
    },
  };
}

function IconCalendar() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
      <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function IconArrowLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M13 8H3M7 12l-4-4 4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function formatDate(date: string) {
  // Parse as UTC noon so the local-timezone render can't shift the day
  return new Date(`${date}T12:00:00Z`).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

// Markdown element styling — brand tokens only, Tailwind v3.4 classes
const markdownComponents: Components = {
  h2: ({ children }) => (
    <h2 className="mt-12 mb-4 font-display text-display-sm md:text-display-md text-brand-white">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-8 mb-3 font-body text-body-lg font-bold text-brand-white">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="mb-5 font-body text-body-md leading-relaxed text-brand-smoke">{children}</p>
  ),
  a: ({ href, children }) => (
    <Link
      href={href ?? '#'}
      className="font-semibold text-brand-red underline decoration-brand-red/40 underline-offset-4 transition-colors hover:text-brand-red-hover hover:decoration-brand-red-hover"
    >
      {children}
    </Link>
  ),
  strong: ({ children }) => <strong className="font-bold text-brand-white">{children}</strong>,
  ul: ({ children }) => (
    <ul className="mb-5 ml-5 list-disc space-y-2 font-body text-body-md text-brand-smoke marker:text-brand-red">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-5 ml-5 list-decimal space-y-2 font-body text-body-md text-brand-smoke marker:text-brand-red">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-1 leading-relaxed">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="mb-5 border-l-2 border-brand-red bg-brand-graphite/50 py-3 pl-5 pr-4 font-body text-body-md italic text-brand-silver [&>p]:mb-0">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-10 border-brand-graphite" />,
  table: ({ children }) => (
    <div className="mb-8 overflow-x-auto rounded-xl border border-brand-ash/60">
      <table className="w-full border-collapse font-body text-body-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-brand-graphite">{children}</thead>,
  th: ({ children }) => (
    <th className="border-b border-brand-ash/60 px-4 py-3 text-left font-mono text-caption uppercase tracking-wider text-brand-white">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-brand-graphite px-4 py-3 text-brand-smoke">{children}</td>
  ),
  code: ({ children }) => (
    <code className="rounded bg-brand-graphite px-1.5 py-0.5 font-mono text-[0.875em] text-brand-cream">
      {children}
    </code>
  ),
};

export default async function PostPage(props: PageProps) {
  const params = await props.params;
  const post = getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const otherPosts = getAllPosts()
    .filter((p) => p.slug !== post.slug)
    .slice(0, 2);

  const blogPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    keywords: post.keywords.join(', '),
    ...(post.ogImage && { image: `${BASE_URL}${post.ogImage}` }),
    author: {
      '@type': 'Organization',
      name: 'Western Wheelcraft Ltd.',
      url: BASE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Western Wheelcraft Ltd.',
      url: BASE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/images/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/blog/${post.slug}`,
    },
  };

  return (
    <>
      <JsonLd id={`blog-posting-${post.slug}`} data={blogPostingSchema} />

      {/* Header */}
      <section className="bg-brand-jet py-16 border-b border-brand-graphite">
        <div className="section-container">
          <FadeIn>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-brand-red hover:gap-3 transition-all mb-6 font-body text-body-sm font-semibold"
            >
              <IconArrowLeft />
              Back to Blog
            </Link>
            <h1 className="mb-4 max-w-3xl font-display text-display-sm md:text-display-md text-brand-white">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 font-mono text-caption text-brand-silver">
              <div className="flex items-center gap-1.5">
                <IconCalendar />
                {formatDate(post.date)}
              </div>
              <div className="flex items-center gap-1.5">
                <IconClock />
                {post.readTime} min read
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Content */}
      <section className="bg-brand-jet py-16 md:py-24">
        <div className="section-container">
          <FadeIn>
            <article className="mx-auto max-w-prose">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {post.content}
              </ReactMarkdown>

              {/* CTA */}
              <div className="mt-14 rounded-xl border border-brand-ash bg-brand-graphite p-8 text-center">
                <p className="mb-2 font-display text-display-sm text-brand-white">
                  Ready to fix your wheels?
                </p>
                <p className="mb-6 font-body text-body-md text-brand-smoke">
                  Snap a photo, get a price in minutes — or lock in a repair date now.
                </p>
                <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Button href="/quote/estimate" variant="primary" size="lg">
                    Get an instant quote
                  </Button>
                  <Button href="/booking" variant="secondary" size="lg">
                    Book a repair
                  </Button>
                </div>
              </div>
            </article>
          </FadeIn>
        </div>
      </section>

      {/* Related Posts */}
      {otherPosts.length > 0 && (
        <section className="bg-brand-jet-light py-24">
          <div className="section-container">
            <FadeIn>
              <div className="mb-12 text-center">
                <h2 className="font-display text-display-md text-brand-white">More Articles</h2>
              </div>
            </FadeIn>
            <div className="grid gap-6 md:grid-cols-2">
              {otherPosts.map((relatedPost, i) => (
                <FadeIn key={relatedPost.slug} delay={i * 60}>
                  <Link href={`/blog/${relatedPost.slug}`}>
                    <article className="group rounded-xl border border-brand-graphite bg-brand-jet p-6 shadow-card transition-all hover:border-brand-red hover:shadow-lg h-full flex flex-col">
                      <h3 className="mb-2 font-display text-body-lg text-brand-white group-hover:text-brand-red transition-colors">
                        {relatedPost.title}
                      </h3>
                      <p className="flex-1 font-body text-body-sm text-brand-smoke mb-4">
                        {relatedPost.description}
                      </p>
                      <div className="font-mono text-caption text-brand-silver">
                        {formatDate(relatedPost.date)}
                      </div>
                    </article>
                  </Link>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
