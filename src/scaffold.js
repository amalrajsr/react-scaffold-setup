// src/scaffold.js
import fs from "fs";
import path from "path";
import { run, log, ensureGitignore, getReactMajor } from "./utils/common.js";
import {
  createFolderStructure,
  scaffoldAppShell,
  scaffoldUIComponents,
  scaffoldFeatureExample,
  scaffoldHooksAndLib,
  ensureIndexCss,
  ensureGlobalTypes,
  writeEnvFiles,
  writeDocsFiles,
  writeTSConfigs,
  fixMainEntry,
  removeViteSamples,
} from "./scaffold/helpers.js";

/**
 * Scaffold a new React project following the exact structure discussed.
 * @param {Object} options
 * @param {string} options.projectName
 * @param {"TypeScript"|"JavaScript"|"ts"|"js"} options.language
 * @param {string} [options.reactVersion] - optional. If omitted => latest (treated as 18+)
 */
export async function scaffoldProject(options) {
  if (!options || typeof options.projectName !== "string" || !options.projectName.trim()) {
    throw new Error("Project name is required");
  }
  const projectName = options.projectName.trim();
  const langInput = (options.language || "TypeScript").toLowerCase();
  const isTS = langInput === "typescript" || langInput === "ts";
  const template = isTS ? "react-ts" : "react";
  const projectPath = path.join(process.cwd(), projectName);
  const pm = normalizePM(options.pm);

  // Guard: don't scaffold into a non-empty existing directory
  if (fs.existsSync(projectPath)) {
    const stat = fs.statSync(projectPath);
    if (stat.isDirectory()) {
      const files = fs.readdirSync(projectPath);
      if (files.length > 0) {
        throw new Error(
          `Target directory "${projectName}" already exists and is not empty. Choose a new name or start with an empty folder.`
        );
      }
    } else {
      throw new Error(`A file named "${projectName}" already exists in this location.`);
    }
  }

  // reactVersion can come from options or --react-version flag
  let reactVersion = options.reactVersion;
  if (!reactVersion) {
    const idx = process.argv.indexOf("--react-version");
    if (idx !== -1 && process.argv[idx + 1]) {
      reactVersion = process.argv[idx + 1];
    }
  }

  // 1) Create Vite app
  log(`Creating Vite project (${template})...`);
  // Quote project name to support spaces and special characters
  run(`${pmCreate(pm)} vite@latest "${escapeQuotes(projectName)}" -- --template ${template} --no-interactive`, process.cwd());

  // 2) Install base deps (node_modules + lockfile)
  log("Installing dependencies...");
  run(installCmd(pm), projectPath);

  // 3) If a specific React version was requested, install it explicitly
  if (reactVersion) {
    log(`Installing React ${reactVersion}...`);
    try {
      run(addDepsCmd(pm, [
        `react@${reactVersion}`,
        `react-dom@${reactVersion}`,
      ]), projectPath);
    } catch (e) {
      log(
        `Provided --react-version "${reactVersion}" is not valid or failed to install. Falling back to latest React.`
      );
      // Install latest stable React
      run(addDepsCmd(pm, ["react", "react-dom"]), projectPath);
      // clear reactVersion to indicate we used latest
      reactVersion = undefined;
    }
  }

  // 4) React Router (Data Router API)
  log("Adding React Router...");
  // Use RRD v6 for React 17 compatibility; latest for React 18+
  const isModernForRouter = !reactVersion || getReactMajor(reactVersion) >= 18;
  const routerPkg = isModernForRouter ? "react-router-dom" : "react-router-dom@^6";
  run(addDepsCmd(pm, [routerPkg]), projectPath);

  log("Creating folder structure...");
  createFolderStructure(projectPath);

  log("Scaffolding app shell, router and example feature...");
  const ext = isTS ? "tsx" : "jsx";
  scaffoldAppShell(projectPath, isTS, ext);
  scaffoldUIComponents(projectPath, isTS, ext, projectName);
  scaffoldFeatureExample(projectPath, isTS, ext);
  scaffoldHooksAndLib(projectPath, isTS);

  ensureIndexCss(projectPath);
  ensureGlobalTypes(projectPath, isTS);

  const isModernReact = !reactVersion || getReactMajor(reactVersion) >= 18;

  writeEnvFiles(projectPath);
  writeDocsFiles(projectPath, isTS, ext, projectName);
  if (isTS) writeTSConfigs(projectPath);
  ensureGitignore(projectPath);
  fixMainEntry(projectPath, isTS, isModernReact);
  removeViteSamples(projectPath);

  // Done
  log("Done! ✅");
  const cdCmd = `cd "${projectName}"`;
  const devCmd = pm === "yarn" ? "yarn dev" : pm === "pnpm" ? "pnpm dev" : "npm run dev";
  console.log(`\nNext steps:\n  ${cdCmd}\n  ${devCmd}\n`);
}

function normalizePM(input) {
  const pm = String(input || "").toLowerCase();
  if (pm === "pnpm" || pm === "yarn" || pm === "npm") return pm;
  const ua = process.env.npm_config_user_agent || "";
  if (ua.includes("pnpm")) return "pnpm";
  if (ua.includes("yarn")) return "yarn";
  return "npm";
}

function pmCreate(pm) {
  if (pm === "pnpm") return "pnpm create";
  if (pm === "yarn") return "yarn create";
  return "npm create";
}

function installCmd(pm) {
  if (pm === "pnpm") return "pnpm install";
  if (pm === "yarn") return "yarn";
  return "npm install";
}

function addDepsCmd(pm, pkgs) {
  const list = pkgs.join(" ");
  if (pm === "pnpm") return `pnpm add ${list}`;
  if (pm === "yarn") return `yarn add ${list}`;
  return `npm install ${list}`;
}

function escapeQuotes(input) {
  return String(input).replaceAll('"', '\\"');
}
