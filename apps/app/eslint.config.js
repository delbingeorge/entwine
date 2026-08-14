import { reactConfig } from "@entwine/config/eslint/react";

export default [...reactConfig, { ignores: ["src/route-tree.gen.ts"] }];
