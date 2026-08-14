import { nextConfig } from "@entwine/config/eslint/next";

export default [...nextConfig, { ignores: [".next/**", "next-env.d.ts"] }];
