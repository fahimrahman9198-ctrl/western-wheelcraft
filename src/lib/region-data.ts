export interface RegionData {
  slug: string;
  name: string;
  province: string;
  description: string;
  shortDescription: string;
  serviceAreas: string[];
  // Populate only with real, attributed customer reviews for this region —
  // the testimonials section is hidden when this is empty (see regions/[slug]/page.tsx).
  testimonials: Array<{
    quote: string;
    author: string;
    role: string;
  }>;
  hasPhysicalLocation: boolean;
  localBusiness: {
    name: string;
    address: string;
    phone: string;
    hours: string;
    lat: number;
    lng: number;
  };
}

export const REGIONS: Record<string, RegionData> = {
  burnaby: {
    slug: 'burnaby',
    name: 'Burnaby',
    province: 'BC',
    description: 'Western Wheelcraft flagship location in Burnaby serves the Lower Mainland with premium wheel refinishing and mobile fleet services.',
    shortDescription: 'Premium wheel refinishing in Burnaby',
    serviceAreas: ['Burnaby', 'Vancouver', 'Surrey', 'Coquitlam', 'Maple Ridge'],
    testimonials: [],
    hasPhysicalLocation: true,
    localBusiness: {
      name: 'Western Wheelcraft - Burnaby',
      address: '3756 Napier Street, Burnaby, BC V5C 3E5',
      phone: '(604) 710-6174',
      hours: 'Mon–Sat 9am–5pm, Sun 12–4:30pm',
      lat: 49.2366,
      lng: -122.9833,
    },
  },
  victoria: {
    slug: 'victoria',
    name: 'Victoria',
    province: 'BC',
    description: 'Serving Vancouver Island with professional wheel refinishing and repair services. Curb rash fixes, diamond cuts, and powder coating.',
    shortDescription: 'Wheel refinishing across Vancouver Island',
    serviceAreas: ['Victoria', 'Saanich', 'Langford', 'View Royal', 'Esquimalt'],
    testimonials: [],
    hasPhysicalLocation: false,
    localBusiness: {
      name: 'Western Wheelcraft - Victoria Service',
      address: 'Service Coverage: Victoria, BC',
      phone: '(604) 710-6174',
      hours: 'By appointment — call for details',
      lat: 48.4281,
      lng: -123.3656,
    },
  },
  kelowna: {
    slug: 'kelowna',
    name: 'Kelowna',
    province: 'BC',
    description: 'Okanagan region wheel refinishing services covering Kelowna, Vernon, and surrounding areas. Same premium quality, now closer to you.',
    shortDescription: 'Professional wheel refinishing in the Okanagan',
    serviceAreas: ['Kelowna', 'Vernon', 'Penticton', 'Kamloops', 'Interior BC'],
    testimonials: [],
    hasPhysicalLocation: false,
    localBusiness: {
      name: 'Western Wheelcraft - Okanagan Service',
      address: 'Service Coverage: Kelowna, Kamloops, Vernon, BC',
      phone: '(604) 710-6174',
      hours: 'By appointment — call for details',
      lat: 49.8859,
      lng: -119.496,
    },
  },
};

export const REGION_SLUGS = Object.keys(REGIONS) as Array<keyof typeof REGIONS>;
