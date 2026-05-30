import { cpSync, existsSync } from "node:fs";
import path from "node:path";

const standaloneDir = path.join(".next", "standalone");
const staticDir = path.join(".next", "static");
const publicDir = "public";

if (!existsSync(standaloneDir)) {
  console.log("copy-standalone-static: no standalone output, skipping");
  process.exit(0);
}

if (!existsSync(staticDir)) {
  console.error("copy-standalone-static: .next/static missing");
  process.exit(1);
}

cpSync(staticDir, path.join(standaloneDir, ".next", "static"), { recursive: true });

if (existsSync(publicDir)) {
  cpSync(publicDir, path.join(standaloneDir, "public"), { recursive: true });
}

console.log("copy-standalone-static: copied .next/static and public into standalone");
