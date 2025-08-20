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
} from "./scaffold/helpers.js";

/**
 * Scaffold a new React project following the exact structure discussed.
 * @param {Object} options
 * @param {string} options.projectName
 * @param {"TypeScript"|"JavaScript"|"ts"|"js"} options.language
 * @param {string} [options.reactVersion] - optional. If omitted => latest (treated as 18+)
 */
export async function scaffoldProject(options) {
  const projectName = options.projectName;
  const langInput = (options.language || "TypeScript").toLowerCase();
  const isTS = langInput === "typescript" || langInput === "ts";
  const template = isTS ? "react-ts" : "react";
  const projectPath = path.join(process.cwd(), projectName);

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
  run(`npm create vite@latest "${projectName}" -- --template ${template}`, process.cwd());

  // 2) Install base deps (node_modules + package-lock.json)
  log("Installing dependencies...");
  run("npm install", projectPath);

  // 3) If a specific React version was requested, install it explicitly
  if (reactVersion) {
    log(`Installing React ${reactVersion}...`);
    try {
      run(`npm install react@${reactVersion} react-dom@${reactVersion}`, projectPath);
    } catch (e) {
      log(
        `Provided --react-version "${reactVersion}" is not valid or failed to install. Falling back to latest React.`
      );
      // Install latest stable React
      run(`npm install react react-dom`, projectPath);
      // clear reactVersion to indicate we used latest
      reactVersion = undefined;
    }
  }

  // 4) React Router (Data Router API)
  log("Adding React Router...");
  run("npm install react-router-dom", projectPath);

  // 5) ESLint deps (JSON config, not flat)
  log("Adding ESLint...");
  const eslintBase = ["eslint", "eslint-plugin-react", "eslint-plugin-react-hooks"];
  const eslintTS = ["@typescript-eslint/parser", "@typescript-eslint/eslint-plugin"];
  run(
    `npm install -D ${[...eslintBase, ...(isTS ? eslintTS : [])].join(" ")}`,
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
  fixMainEntry(projectPath, isTS);

  // 15) npm scripts
  addLintScripts(projectPath);
  
  // Done
  log("Done! ✅");
  console.log(`\nNext steps:\n  cd ${projectName}\n  npm run dev\n`);
}
