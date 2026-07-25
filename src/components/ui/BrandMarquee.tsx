import Image from "next/image";

const vehicleBrands = [
  { name: "Toyota", logo: "/images/vehicle-brands/toyota.svg" },
  { name: "Audi", logo: "/images/vehicle-brands/audi.svg" },
  { name: "BMW", logo: "/images/vehicle-brands/bmw.svg" },
  { name: "Chevrolet", logo: "/images/vehicle-brands/chevrolet.png" },
  { name: "GMC", logo: "/images/vehicle-brands/gmc.svg" },
  { name: "Dodge", logo: "/images/vehicle-brands/dodge.svg" },
  { name: "Ford", logo: "/images/vehicle-brands/ford.svg" },
  { name: "Mercedes-Benz", logo: "/images/vehicle-brands/mercedes-benz.svg" },
  { name: "Porsche", logo: "/images/vehicle-brands/porsche.png" },
  { name: "Lexus", logo: "/images/vehicle-brands/lexus.svg" },
  { name: "Honda", logo: "/images/vehicle-brands/honda.svg" },
  { name: "Volkswagen", logo: "/images/vehicle-brands/volkswagen.svg" },
  { name: "Acura", logo: "/images/vehicle-brands/acura.svg" },
  { name: "Hyundai", logo: "/images/vehicle-brands/hyundai.svg" },
  { name: "Infiniti", logo: "/images/vehicle-brands/infiniti.svg" },
  { name: "Mazda", logo: "/images/vehicle-brands/mazda.svg" },
  { name: "Nissan", logo: "/images/vehicle-brands/nissan.svg" },
  { name: "Subaru", logo: "/images/vehicle-brands/subaru.svg" },
  { name: "Tesla", logo: "/images/vehicle-brands/tesla.svg" },
  { name: "Volvo", logo: "/images/vehicle-brands/volvo.svg" },
  { name: "Jeep", logo: "/images/vehicle-brands/jeep.png" },
  { name: "RAM", logo: "/images/vehicle-brands/ram.svg" },
];

function BrandSet({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul
      className="brand-marquee-set"
      aria-hidden={hidden ? "true" : undefined}
      role={hidden ? "presentation" : "list"}
    >
      {vehicleBrands.map((brand) => (
        <li key={brand.name} className="brand-marquee-item">
          <Image
            src={brand.logo}
            alt={`${brand.name} logo`}
            width={150}
            height={54}
            className="brand-marquee-logo"
          />
        </li>
      ))}
    </ul>
  );
}

export function BrandMarquee() {
  return (
    <section
      className="relative overflow-hidden border-y border-brand-ash bg-brand-jet-light py-20"
      aria-labelledby="brand-marquee-title"
    >
      <div className="pointer-events-none absolute left-1/2 top-0 h-32 w-[36rem] -translate-x-1/2 rounded-full bg-brand-red/[0.06] blur-3xl" aria-hidden="true" />

      <div className="section-container relative mb-8 text-center">
        <div className="accent-line mx-auto mb-5" aria-hidden="true" />
        <p className="mb-3 font-body text-caption font-bold uppercase tracking-[0.22em] text-brand-red">
          Every make. One standard.
        </p>
        <h2 id="brand-marquee-title" className="font-display text-display-sm text-brand-white md:text-display-md">
          Wheels We Work With
        </h2>
      </div>

      <div className="brand-marquee" aria-label="Vehicle makes serviced by Western Wheelcraft">
        <div className="brand-marquee-track">
          <BrandSet />
          <BrandSet hidden />
        </div>
      </div>
    </section>
  );
}
