import type { ReactNode } from "react";

import authPlate from "@/assets/auth-plate.svg";

import { BrandMark } from "./brand-mark";

interface SplitLayoutProps {
  children: ReactNode;
}

export const SplitLayout = ({ children }: SplitLayoutProps) => (
  <div className="grid min-h-screen lg:grid-cols-2">
    <div className="flex flex-col px-8 lg:px-14">
      <header className="flex items-center py-6">
        <BrandMark />
      </header>
      <main className="flex flex-1 items-end pb-8">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
    <section className="hidden h-full lg:block">
      <img alt="" className="size-full object-cover" src={authPlate} />
    </section>
  </div>
);
