import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Entwine",
  description: "An agent that finds you tech roles across India and SEA — salary shown upfront.",
};

const RootLayout = ({ children }: { children: ReactNode }) => (
  <html lang="en">
    <body className="bg-surface text-ink antialiased">{children}</body>
  </html>
);

export default RootLayout;
