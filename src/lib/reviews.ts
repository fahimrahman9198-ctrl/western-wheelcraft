export interface Review {
  author: string;
  rating: number; // 1-5
  text: string;
  date: string;
  verified: boolean;
}

// Sample reviews (these would come from Google, Trustpilot, or your own review system in production)
export const REVIEWS: Review[] = [
  {
    author: 'John Martinez',
    rating: 5,
    text: 'Excellent work on my wheels. The refinishing looks factory-perfect. Highly recommend!',
    date: '2026-06-15',
    verified: true,
  },
  {
    author: 'Sarah Chen',
    rating: 5,
    text: 'Fast turnaround and outstanding quality. My wheels look brand new.',
    date: '2026-06-10',
    verified: true,
  },
  {
    author: 'Mike Thompson',
    rating: 5,
    text: 'Professional team, reasonable pricing, and they handle curb rash repairs perfectly.',
    date: '2026-06-05',
    verified: true,
  },
  {
    author: 'Lisa Park',
    rating: 5,
    text: 'We use them for our dealership fleet. Consistently excellent work and reliable service.',
    date: '2026-05-30',
    verified: true,
  },
  {
    author: 'Robert Walsh',
    rating: 4,
    text: 'Great work overall. Minor delivery delay but the quality was worth the wait.',
    date: '2026-05-25',
    verified: true,
  },
];

export function getAverageRating(): number {
  if (REVIEWS.length === 0) return 0;
  const sum = REVIEWS.reduce((acc, review) => acc + review.rating, 0);
  return Math.round((sum / REVIEWS.length) * 10) / 10;
}

export function getRatingDistribution() {
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  REVIEWS.forEach((review) => {
    distribution[review.rating as keyof typeof distribution]++;
  });
  return distribution;
}

export function getAggregateRatingSchema() {
  const avg = getAverageRating();
  return {
    '@context': 'https://schema.org',
    '@type': 'AggregateRating',
    '@id': 'https://westernwheelcraft.ca/#aggregate-rating',
    ratingValue: avg,
    ratingCount: REVIEWS.length,
    reviewCount: REVIEWS.length,
    bestRating: 5,
    worstRating: 1,
  };
}

export function getReviewsSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://westernwheelcraft.ca/#business',
    name: 'Western Wheelcraft',
    review: REVIEWS.map((review) => ({
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating,
        bestRating: 5,
        worstRating: 1,
      },
      author: {
        '@type': 'Person',
        name: review.author,
      },
      reviewBody: review.text,
      datePublished: review.date,
    })),
  };
}
