export interface RegionData {
  slug: string;
  name: string;
  province: string;
  description: string;
  shortDescription: string;
  serviceAreas: string[];
  testimonials: Array<{
    quote: string;
    author: string;
    role: string;
  }>;
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
    testimonials: [
      {
        quote: "The quality and turnaround time are unmatched. We've been using Western Wheelcraft for over 5 years.",
        author: 'John Martinez',
        role: 'Fleet Manager, Local Dealership',
      },
      {
        quote: "My wheels came back looking like new. Couldn't be happier with the finish and attention to detail.",
        author: 'Sarah Chen',
        role: 'Vehicle Owner, Burnaby',
      },
    ],
    localBusiness: {
      name: 'Western Wheelcraft - Burnaby',
      address: '3756 Napier Street, Burnaby, BC V5C 3C6',
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
    testimonials: [
      {
        quote: "Finally found a shop that understands premium finishes. Highly recommend for island residents.",
        author: 'Mike Thompson',
        role: 'Auto Enthusiast, Victoria',
      },
      {
        quote: "Mobile service was a game-changer. They came right to the dealership and handled everything.",
        author: 'Lisa Park',
        role: 'Service Director, Victoria Dealership',
      },
    ],
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
    testimonials: [
      {
        quote: "No need to drive to Vancouver anymore. Western Wheelcraft brings professional refinishing to the Okanagan.",
        author: 'Robert Walsh',
        role: 'Dealership Owner, Kelowna',
      },
      {
        quote: "Quality is consistent with their main shop. Great service and honest pricing.",
        author: 'Jennifer Liu',
        role: 'Vehicle Owner, Kamloops',
      },
    ],
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
