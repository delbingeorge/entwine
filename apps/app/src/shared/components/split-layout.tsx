import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

import { BrandMark } from "./brand-mark";
import { MorphSlider } from "./morph-slider";
import { PlateCredit } from "./plate-credit";

import type { PlatePhotographer } from "./plate-credit";

const unsplash = (id: string) =>
  `https://images.unsplash.com/${id}?q=80&w=1600&auto=format&fit=crop`;

const plateSlides = [
  { image: unsplash("photo-1549472579-e133f59d8b23") },
  { image: unsplash("photo-1470071459604-3b5ec3a7fe05") },
  { image: unsplash("photo-1501854140801-50d01698950b") },
  { image: unsplash("photo-1426604966848-d7adac402bff") },
  { image: unsplash("photo-1517411032315-54ef2cb783bb") },
];

const platePhotographers: PlatePhotographer[] = [];

interface SplitLayoutProps {
  children: ReactNode;
  headerAside?: ReactNode;
  wide?: boolean;
}

export const SplitLayout = ({ children, headerAside, wide = false }: SplitLayoutProps) => (
  <div className="grid min-h-screen lg:grid-cols-2">
    <div className="flex flex-col px-8 lg:px-14">
      <header className="flex items-center justify-between gap-4 py-6">
        <BrandMark />
        {headerAside}
      </header>
      <main className="flex flex-1 items-end pb-8">
        <div className={cn("w-full", !wide && "max-w-md")}>{children}</div>
      </main>
    </div>
    <section className="group relative hidden h-full lg:block">
      <MorphSlider
        autoplay
        autoplayDelay={5}
        drift={0.4}
        duration={1.4}
        intensity={0.3}
        items={plateSlides}
        radius={0}
        showCaptions={false}
        showControls={false}
        showIndicators={false}
        transition="melt"
      />
      <PlateCredit photographers={platePhotographers} />
    </section>
  </div>
);
