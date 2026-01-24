import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./__tests__/setup.ts"],
    include: ["__tests__/**/*.test.ts", "__tests__/**/*.test.tsx"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: [
        "utils/**/*.ts",
        "lib/**/*.ts",
        "actions/**/*.ts",
        "app/api/**/*.ts"
      ],
      exclude: [
        "node_modules",
        "__tests__",
        "*.config.*"
      ]
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./")
    }
  }
});
