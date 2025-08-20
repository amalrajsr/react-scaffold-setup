// src/utils/common.js
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

export function run(cmd, cwd) {
  execSync(cmd, { cwd, stdio: "inherit" });
}

export function log(msg) {
  console.log(`\n${msg}`);
}

export function mkdirp(p) {
  fs.mkdirSync(p, { recursive: true });
}

export function writeFile(p, content) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
}

export function appendFile(p, content) {
  if (!fs.existsSync(p)) {
    writeFile(p, content);
  } else {
    fs.appendFileSync(p, `\n${content}`);
  }
}

export function ensureGitignore(projectPath) {
  const gi = path.join(projectPath, ".gitignore");
  const required = ["node_modules", "dist", ".env", ".DS_Store"];
  let existing = "";
  if (fs.existsSync(gi)) existing = fs.readFileSync(gi, "utf8");
  const lines = new Set(existing.split("\n").filter(Boolean));
  required.forEach((r) => lines.add(r));
  fs.writeFileSync(gi, Array.from(lines).join("\n") + "\n");
}

// Extract React major version from various inputs (e.g., "18", "18.2.0", "^18.2.0", ">=18", "latest")
export function getReactMajor(input) {
  if (!input) return 18;
  const m = String(input).match(/(\d{1,3})/);
  const major = m ? Number.parseInt(m[1], 10) : NaN;
  return Number.isFinite(major) ? major : 18;
}
