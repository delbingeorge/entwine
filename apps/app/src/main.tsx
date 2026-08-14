import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { RouterProvider, createRouter } from "@tanstack/react-router";

import { routeTree } from "@/route-tree.gen";

import "@/styles/globals.css";

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element #root is missing from index.html");
}

createRoot(rootElement).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
