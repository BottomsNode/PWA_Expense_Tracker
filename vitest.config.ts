import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        globals: true,
        environment: "jsdom",

        // Enable coverage for CI
        coverage: {
            provider: "v8",
            reportsDirectory: "./coverage",
        },
    },
});
