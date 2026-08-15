import type { ReactNode } from "react";

import { AuthPlate } from "./auth-plate";
import { AuthTopBar } from "./auth-top-bar";

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => (
  <div className="grid min-h-screen lg:grid-cols-2">
    <div className="flex flex-col px-8 lg:px-14">
      <AuthTopBar />
      <main className="flex flex-1 items-end pb-8">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
    <AuthPlate />
  </div>
);
