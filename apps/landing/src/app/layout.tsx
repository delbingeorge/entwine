import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SolarProvider } from "@solar-icons/react";

import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Entwine",
  description: "An agent that finds you tech roles across India and SEA — salary shown upfront.",
};

const RootLayout = ({ children }: { children: ReactNode }) => (
  <html lang="en">
    <body className="bg-surface text-ink antialiased">
      <SolarProvider color="currentColor" size={20} strokeWidth={1.5}>
        {children}
      </SolarProvider>
    </body>
  </html>
);

export default RootLayout;
