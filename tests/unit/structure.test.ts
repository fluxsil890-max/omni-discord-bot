import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("Project Structure", () => {
  it("should have all required directories", () => {
    const dirs = [
      "src",
      "src/commands",
      "src/commands/slash",
      "src/commands/interfaces",
      "src/events",
      "src/events/interfaces",
      "src/discord",
      "src/discord/handlers",
      "src/services",
      "src/database",
      "src/config",
      "src/types",
      "src/scripts",
      "prisma",
      "tests",
      "tests/unit",
      "docs",
    ];

    for (const dir of dirs) {
      const fullPath = path.join(process.cwd(), dir);
      expect(fs.existsSync(fullPath), `Directory ${dir} should exist`).toBe(true);
    }
  });
});
