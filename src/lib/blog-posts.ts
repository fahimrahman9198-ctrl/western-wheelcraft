export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category: string;
  readTime: number;
  seoDescription: string;
}

const curb_rash_content = `Curb rash is one of the most common wheel damage issues we see. Whether you clipped a curb during parking or hit a pothole, we can fix it.

## What is Curb Rash

Curb rash occurs when the sidewall of your wheel makes contact with a curb, concrete edge, or similar surface. This causes:
- Scuffs and scratches on the surface
- Paint/coating damage
- Bent or dented edges
- Loss of original finish

## Can We Repair It

In most cases, yes. Our process:

1. Assessment - We evaluate the damage depth and extent
2. Straightening - For minor bends, we straighten the wheel back to round
3. Sanding & Prep - Remove all damaged material
4. Refinishing - Apply new finish (color match, diamond cut, or powder coat)
5. Quality Check - Inspect for factory-quality results

## Cost & Turnaround

- Minor scuffs: $50-150 per wheel
- Deep rash with dents: $150-300+ per wheel
- Turnaround: 5-7 business days (24-48 hour express available)

## Prevention Tips

- Use wheel spacers or tire wall protectors
- Park in ample spaces with room to maneuver
- Consider protective film on high-risk wheels
- Avoid driving close to curbs in wet conditions

Contact us today for a free curb rash repair estimate.`;

const diamond_cut_content = `When refinishing your wheels, you have two main options: diamond cut and powder coat. Here is how they compare.

## Diamond Cut Finish

A diamond cut exposes the bare aluminum beneath the protective clear coat, creating a bright, mirror-like finish.

Pros:
- Stunning, factory-like appearance
- Reflects light beautifully
- Shows off the wheel design
- Premium look that stands out

Cons:
- Requires regular maintenance
- More susceptible to oxidation (over 5+ years)
- Must maintain clear coat protection
- Higher cost than solid colors

## Powder Coat Finish

A powder coat applies a durable, solid-color finish that bonds directly to the wheel.

Pros:
- Extremely durable (10+ years)
- Minimal maintenance required
- Wide color options (OEM match, custom colors)
- More affordable than diamond cut

Cons:
- Solid color (does not expose aluminum)
- Less premium appearance (though still looks great)
- Cannot easily change colors without stripping

## Our Recommendation

- Diamond Cut: For those who want maximum visual impact and do not mind periodic maintenance
- Powder Coat: For those prioritizing durability and easy upkeep

Both finishes come with our lifetime workmanship guarantee. Call us to discuss which is right for your wheels.`;

const warranty_content = `We back every wheel refinishing job with a lifetime workmanship guarantee. Here is what that means.

## What is Covered

Our lifetime warranty covers:
- Finish failure due to our work - If your powder coat peels or diamond cut clear coat fails, we refinish at no charge
- Workmanship defects - Imperfections caused by our process (runs, sags, overspray)
- Color matching - If the finish does not match your specification

## What is NOT Covered

The warranty does NOT cover:
- Accident damage - New curb rash, road debris impact, or accidents post-refinishing
- Normal wear - Oxidation on diamond cuts (this is normal after 5+ years of sun exposure)
- Abuse - Harsh chemicals, abrasive cleaners, or improper maintenance
- Aftermarket changes - If you modify or repaint the wheels after our work

## How to Claim

If you believe your wheels have a workmanship defect:

1. Contact us with photos
2. Bring your wheels in for inspection
3. If warranty-eligible, we refinish at no cost
4. Turnaround is prioritized

## Maintenance Tips to Preserve Your Warranty

For Diamond Cut Wheels:
- Wash with mild soap and warm water
- Dry with soft microfiber cloth
- Apply clear coat protectant annually
- Avoid harsh chemicals and abrasive pads

For Powder Coat Wheels:
- Regular washing is sufficient
- Use gentle tire shine (not on coating)
- Avoid high-pressure washers on finish

## Why We Offer This Guarantee

We are confident in our work. Every wheel is hand-finished by experienced technicians using premium materials. Our reputation is built on quality, and we stand behind it completely.

Questions about your warranty? Call us at (604) 710-6174.`;

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'curb-rash-repair-guide',
    title: 'Complete Guide to Curb Rash Repair',
    excerpt: 'Learn how professional curb rash repair can restore your wheels to factory condition.',
    content: curb_rash_content,
    author: 'Western Wheelcraft',
    date: '2026-06-20',
    category: 'Repair',
    readTime: 5,
    seoDescription: 'Professional curb rash repair guide. Learn how we restore damaged wheels to factory condition and prevent future damage.',
  },
  {
    slug: 'diamond-cut-vs-powder-coat',
    title: 'Diamond Cut vs Powder Coat: Which Finish is Right for You?',
    excerpt: 'Compare the two most popular wheel finishes and choose the best option for your vehicle.',
    content: diamond_cut_content,
    author: 'Western Wheelcraft',
    date: '2026-06-15',
    category: 'Finishes',
    readTime: 6,
    seoDescription: 'Diamond cut vs powder coat comparison. Learn the pros, cons, and best applications for each wheel finish option.',
  },
  {
    slug: 'wheel-refinishing-warranty',
    title: 'Our Lifetime Workmanship Warranty Explained',
    excerpt: 'Learn what is covered under our warranty and how we stand behind our work.',
    content: warranty_content,
    author: 'Western Wheelcraft',
    date: '2026-06-10',
    category: 'Service',
    readTime: 5,
    seoDescription: 'Western Wheelcraft lifetime workmanship warranty. Learn what is covered, exclusions, and maintenance tips to preserve your finish.',
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

export function getAllPosts(): BlogPost[] {
  return BLOG_POSTS.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostsByCategory(category: string): BlogPost[] {
  return BLOG_POSTS.filter((post) => post.category === category).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}