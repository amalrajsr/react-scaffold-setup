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
  writeEslintConfigFile,
  writeEnvFiles,
  writeDocsFiles,
  writeTSConfigs,
  fixMainEntry,
  addLintScripts,
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
  run(`${pmCreate(pm)} vite@latest "${escapeQuotes(projectName)}" -- --template ${template}`, process.cwd());

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
  run(addDepsCmd(pm, ["react-router-dom"]), projectPath);

  // 5) ESLint deps (JSON config, not flat)
  log("Adding ESLint...");
  const eslintBase = ["eslint", "eslint-plugin-react", "eslint-plugin-react-hooks"];
  const eslintTS = ["@typescript-eslint/parser", "@typescript-eslint/eslint-plugin"];
  run(
    addDevDepsCmd(pm, [...eslintBase, ...(isTS ? eslintTS : [])]),
    projectPath
  );

  // 6) Create required folders (exact structure)
  log("Creating folder structure...");
  createFolderStructure(projectPath);
  
  // 7) Files: App, Router, Layouts, Example feature, Lib, Hooks, Types
  log("Scaffolding app shell, router and example feature...");
  const ext = isTS ? "tsx" : "jsx";
  scaffoldAppShell(projectPath, isTS, ext);
  scaffoldUIComponents(projectPath, isTS, ext, projectName);
  scaffoldFeatureExample(projectPath, isTS, ext);
  scaffoldHooksAndLib(projectPath, isTS);

  // 8) index.css & global types (TS)
  ensureIndexCss(projectPath);
  ensureGlobalTypes(projectPath, isTS);

  // 9) ESLint config (.eslintrc.json) based on effective React version
  const isModernReact = !reactVersion || getReactMajor(reactVersion) >= 18;
  writeEslintConfigFile(projectPath, isTS, isModernReact);

  // 10) .env & .env.sample
  writeEnvFiles(projectPath);

  // 11) SETUP.md & README.md
  writeDocsFiles(projectPath, isTS, ext, projectName, isModernReact);

  // 12) TS configs
  if (isTS) writeTSConfigs(projectPath);

  // 13) .gitignore
  ensureGitignore(projectPath);

  // 14) main entry
  fixMainEntry(projectPath, isTS, isModernReact);

  // 14.1) remove Vite sample artifacts
  removeViteSamples(projectPath);

  // 15) npm scripts
  addLintScripts(projectPath);
  
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
  if (pm === "pnpm") return "pnpm dlx";
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

function addDevDepsCmd(pm, pkgs) {
  const list = pkgs.join(" ");
  if (pm === "pnpm") return `pnpm add -D ${list}`;
  if (pm === "yarn") return `yarn add -D ${list}`;
  return `npm install -D ${list}`;
}

function escapeQuotes(input) {
  return String(input).replaceAll('"', '\\"');
}

function removeDepsCmd(pm, pkgs) {
  const list = pkgs.join(" ");
  if (pm === "pnpm") return `pnpm remove ${list}`;
  if (pm === "yarn") return `yarn remove ${list}`;
  return `npm uninstall ${list}`;
}
