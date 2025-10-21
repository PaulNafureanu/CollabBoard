// server/jest.config.ts
import type { Config } from "jest";

const config: Config = {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.ts"],
  transform: { "^.+\\.tsx?$": ["ts-jest", { tsconfig: "tsconfig.json" }] },
  setupFilesAfterEnv: ["<rootDir>/tests/jest.setup.ts"],
  globalTeardown: "<rootDir>/tests/jest.teardown.ts",
  verbose: false,
  forceExit: true, // keeps sockets from lingering in CI
};
export default config;
