import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllPosts } from '@/lib/blog-posts';
import { FadeIn } from '@/components/ui/FadeIn';

export const metadata: Metadata = {
  title: 'Blog — Wheel Refinishing Tips & Guides',
  description:
    'Expert guides on wheel refinishing, curb rash repair, powder coating, diamond cuts, and maintenance tips for your wheels.',
  keywords: ['wheel refinishing', 'curb rash', 'wheel repair', 'diamond cut', 'powder coat'],
};

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

function IconArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-jet py-24">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-brand-red/5 blur-3xl" />
          <div className="absolute -left-20 bottom-0 h-[400px] w-[400px] rounded-full bg-brand-red/4 blur-3xl" />
        </div>
        <div className="section-container relative">
          <FadeIn>
            <div className="max-w-2xl">
              <h1 className="mb-4 font-display text-display-lg md:text-display-xl text-brand-white">
                Wheel Refinishing Blog
              </h1>
              <p className="mb-8 max-w-lg font-body text-body-lg text-brand-smoke">
                Expert guides, tips, and insights on wheel refinishing, maintenance, and care.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="bg-brand-jet-light py-24">
        <div className="section-container">
          <div className="grid gap-6 md:grid-cols-2">
            {posts.map((post, i) => (
              <FadeIn key={post.slug} delay={i * 60}>
                <Link href={`/blog/${post.slug}`}>
                  <article className="group rounded-xl border border-brand-graphite bg-brand-jet p-6 shadow-card transition-all hover:border-brand-red hover:shadow-lg h-full flex flex-col">
                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-4 mb-4 text-caption text-brand-silver">
                      <div className="flex items-center gap-1.5">
                        <IconCalendar />
                        {new Date(post.date).toLocaleDateString('en-CA', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <IconClock />
                        {post.readTime} min read
                      </div>
                      <span className="rounded-full bg-brand-red/10 px-2.5 py-0.5 text-brand-red font-medium">
                        {post.category}
                      </span>
                    </div>

                    {/* Content */}
                    <h2 className="mb-2 font-display text-body-lg text-brand-white group-hover:text-brand-red transition-colors">
                      {post.title}
                    </h2>
                    <p className="mb-4 flex-1 font-body text-body-sm text-brand-smoke">
                      {post.excerpt}
                    </p>

                    {/* CTA */}
                    <div className="flex items-center gap-2 font-body text-body-sm font-semibold text-brand-red group-hover:gap-3 transition-all">
                      Read More
                      <IconArrowRight />
                    </div>
                  </article>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
