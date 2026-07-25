export interface Review {
  author: string;
  rating: number; // 1-5
  text: string;
  date: string;
  verified: boolean;
}

// Real customer reviews only. Do not add placeholder/sample data here — this
// feeds public AggregateRating/Review schema, and fabricated ratings are a
// Google structured-data policy violation. Populate as real reviews come in.
export const REVIEWS: Review[] = [];

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
