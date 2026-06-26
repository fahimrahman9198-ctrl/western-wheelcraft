/**
 * JSON-LD structured data generators for SEO
 */

export const LocalBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'AutoRepair',
  '@id': 'https://westernwheelcraft.ca/#business',
  name: 'Western Wheelcraft',
  description: "BC's trusted wheel refinishing and restoration experts",
  url: 'https://westernwheelcraft.ca',
  telephone: '+1-604-710-6174',
  email: 'contact@westernwheelcraft.ca',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '3756 Napier Street',
    addressLocality: 'Burnaby',
    addressRegion: 'BC',
    postalCode: 'V5C 3C6',
    addressCountry: 'CA',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 49.2366,
    longitude: -122.9833,
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '09:00',
      closes: '17:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Sunday',
      opens: '12:00',
      closes: '16:30',
    },
  ],
  areaServed: {
    '@type': 'GeoShape',
    description: 'Lower Mainland BC, Vancouver Island, Okanagan',
  },
  priceRange: '$',
  image: 'https://westernwheelcraft.ca/og-image.svg',
};

export const OrganizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': 'https://westernwheelcraft.ca/#org',
  name: 'Western Wheelcraft',
  url: 'https://westernwheelcraft.ca',
  logo: 'https://westernwheelcraft.ca/images/logo.PNG',
  description: 'Premium wheel refinishing and restoration for BC dealerships and individuals',
  email: 'contact@westernwheelcraft.ca',
  telephone: '+1-604-710-6174',
  foundingDate: '1989',
  knowsAbout: ['wheel refinishing', 'alloy wheel repair', 'diamond cut wheels', 'powder coating'],
};

export const ServiceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Professional Wheel Refinishing',
  description: 'Expert wheel refinishing and restoration services including diamond cut, powder coating, and curb rash repair',
  provider: {
    '@type': 'LocalBusiness',
    name: 'Western Wheelcraft',
    url: 'https://westernwheelcraft.ca',
  },
  areaServed: 'BC',
  availableChannel: {
    '@type': 'ServiceChannel',
    serviceUrl: 'https://westernwheelcraft.ca/quote',
  },
};

export const FAQSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How long does wheel refinishing take?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Standard turnaround is 5–7 business days for most jobs. We offer expedited service (24–48 hours) for trade accounts and urgent orders.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the difference between diamond cut and powder coat finishes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Diamond cut exposes bare aluminum for a bright, mirror finish with a clear protective coat. Powder coat is a solid color finish applied electrostatically for durability. Both offer factory-matched quality.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can you repair curb rash and damage?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. We repair curb rash, bends, and cracks using specialized techniques, then refinish to original appearance. Most damage is repairable.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you offer a warranty on refinished wheels?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We provide a lifetime workmanship guarantee on all finishes. If finish failure occurs due to our work, we refinish at no charge.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you ship wheels outside BC?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, we ship across Canada. Contact us for a quote on your location.',
      },
    },
  ],
};

export const BreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});
