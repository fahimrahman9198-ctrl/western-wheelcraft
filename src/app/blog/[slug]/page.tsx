import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPost, getAllPosts } from '@/lib/blog-posts';
import { FadeIn } from '@/components/ui/FadeIn';
import { Button } from '@/components/ui/Button';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const post = getPost(params.slug);

  if (!post) return {};

  return {
    title: `${post.title} | Western Wheelcraft Blog`,
    description: post.seoDescription,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
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

export default async function PostPage(props: PageProps) {
  const params = await props.params;
  const post = getPost(params.slug);

  if (!post) {
    notFound();
  }

  const otherPosts = getAllPosts()
    .filter((p) => p.slug !== post.slug)
    .slice(0, 2);

  return (
    <>
      {/* Header */}
      <section className="bg-brand-jet py-16 border-b border-brand-graphite">
        <div className="section-container">
          <FadeIn>
            <Link href="/blog" className="inline-flex items-center gap-2 text-brand-red hover:gap-3 transition-all mb-6 font-body text-body-sm font-semibold">
              <IconArrowLeft />
              Back to Blog
            </Link>
            <h1 className="mb-4 font-display text-display-md text-brand-white">{post.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-caption text-brand-silver">
              <div className="flex items-center gap-1.5">
                <IconCalendar />
                {new Date(post.date).toLocaleDateString('en-CA', {
                  year: 'numeric',
                  month: 'long',
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
          </FadeIn>
        </div>
      </section>

      {/* Content */}
      <section className="bg-brand-jet py-24">
        <div className="section-container max-w-2xl">
          <FadeIn>
            <article className="prose prose-invert max-w-none">
              <style>{`
                .prose-invert h2 {
                  font-family: var(--font-archivo);
                  font-size: 1.875rem;
                  font-weight: bold;
                  color: #ffffff;
                  margin-top: 2rem;
                  margin-bottom: 1rem;
                }
                .prose-invert h3 {
                  font-size: 1.25rem;
                  font-weight: 600;
                  color: #ffffff;
                  margin-top: 1.5rem;
                  margin-bottom: 0.75rem;
                }
                .prose-invert p {
                  font-family: var(--font-manrope);
                  font-size: 1rem;
                  line-height: 1.6;
                  color: #cccccc;
                  margin-bottom: 1rem;
                }
                .prose-invert ul, .prose-invert ol {
                  color: #cccccc;
                  margin-bottom: 1rem;
                }
                .prose-invert li {
                  margin-bottom: 0.5rem;
                }
                .prose-invert strong {
                  color: #ffffff;
                }
              `}</style>
              <div
                dangerouslySetInnerHTML={{
                  __html: post.content
                    .split('\n\n')
                    .map((para) => {
                      if (para.startsWith('##')) {
                        return `<h2>${para.replace(/^## /, '')}</h2>`;
                      } else if (para.startsWith('###')) {
                        return `<h3>${para.replace(/^### /, '')}</h3>`;
                      } else if (para.startsWith('-')) {
                        const items = para.split('\n').map((line) => `<li>${line.replace(/^- /, '')}</li>`).join('');
                        return `<ul>${items}</ul>`;
                      } else if (para.startsWith('1.')) {
                        const items = para.split('\n').map((line) => `<li>${line.replace(/^\d+\. /, '')}</li>`).join('');
                        return `<ol>${items}</ol>`;
                      }
                      return `<p>${para}</p>`;
                    })
                    .join(''),
                }}
              />
            </article>

            {/* CTA */}
            <div className="mt-12 rounded-xl border border-brand-ash bg-brand-graphite p-8 text-center">
              <p className="mb-4 font-body text-body-lg text-brand-white">
                Ready to refinish your wheels?
              </p>
              <Button href="/quote" variant="primary" size="lg">
                Get a Free Quote
              </Button>
            </div>
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
                        {relatedPost.excerpt}
                      </p>
                      <div className="text-caption text-brand-silver">
                        {new Date(relatedPost.date).toLocaleDateString('en-CA', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
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
