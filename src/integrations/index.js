import path from "path";
import fs from "fs";
import { log, run } from "../utils/common.js";
import { integrateTailwind } from "./tailwind.js";
import { integrateReactQuery } from "./reactQuery.js";
import { integrateZustand } from "./zustand.js";
import { integrateAxios } from "./axios.js";

function detectPM() {
  const ua = process.env.npm_config_user_agent || "";
  if (ua.includes("pnpm")) return "pnpm";
  if (ua.includes("yarn")) return "yarn";
  return "npm";
}

export async function applyIntegrations(projectPath, integrations, opts = {}) {
  const pm = detectPM();
  const requested = new Set(integrations.map((s) => String(s).toLowerCase()));
  const results = [];
  if (!fs.existsSync(path.join(projectPath, "src"))) {
    throw new Error("Run this inside a project (src folder not found)");
  }
  // detect React major version from package.json when available
  let reactMajor = 18;
  try {
    const pkgJson = JSON.parse(fs.readFileSync(path.join(projectPath, "package.json"), "utf8"));
    const rv = (pkgJson.dependencies && (pkgJson.dependencies.react || pkgJson.dependencies["react"]))
      || (pkgJson.peerDependencies && (pkgJson.peerDependencies.react || pkgJson.peerDependencies["react"]))
      || (pkgJson.devDependencies && (pkgJson.devDependencies.react || pkgJson.devDependencies["react"]))
      || "";
    const m = String(rv).match(/(\d{1,3})/);
    if (m) reactMajor = parseInt(m[1], 10) || 18;
  } catch {}

  if (requested.has("tailwind")) {
    results.push(await integrateTailwind(projectPath, pm, opts));
  }
  if (requested.has("react-query") || requested.has("reactquery") || requested.has("tanstack")) {
    results.push(await integrateReactQuery(projectPath, pm, reactMajor, opts));
  }
  if (requested.has("zustand")) {
    results.push(await integrateZustand(projectPath, pm, opts));
  }
  if (requested.has("axios")) {
    results.push(await integrateAxios(projectPath, pm, opts));
  }

  if (results.length === 0) log("No supported integrations requested.");
  return results;
}
