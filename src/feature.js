// src/feature.js
import fs from "fs";
import path from "path";
import { mkdirp, writeFile, log } from "./utils/common.js";

function detectTypeScript(projectPath) {
  return (
    fs.existsSync(path.join(projectPath, "tsconfig.json")) ||
    fs.existsSync(path.join(projectPath, "tsconfig.app.json")) ||
    fs.existsSync(path.join(projectPath, "src/main.tsx"))
  );
}

function validateFeatureName(name) {
  if (!name || typeof name !== "string") return false;
  const n = name.trim();
  // allow letters, numbers, dashes and underscores
  return /^[a-zA-Z0-9-_]+$/.test(n);
}

function ensureProjectStructure(projectPath) {
  const srcDir = path.join(projectPath, "src");
  const featuresDir = path.join(srcDir, "features");
  if (!fs.existsSync(srcDir)) {
    throw new Error("Not a valid project: 'src' folder not found in current directory.");
  }
  if (!fs.existsSync(featuresDir)) {
    // create if missing
    mkdirp(featuresDir);
  }
  return featuresDir;
}

function scaffoldSingleFeature(projectPath, featureName, isTS, { force = false, dryRun = false } = {}) {
  const featuresDir = ensureProjectStructure(projectPath);
  const name = featureName.trim();
  if (!validateFeatureName(name)) {
    throw new Error(`Invalid feature name: ${featureName}`);
  }
  const base = path.join(featuresDir, name);
  const exists = fs.existsSync(base);
  if (exists && !force) {
    log(`Feature '${name}' already exists. Skipping (use --force to overwrite).`);
    return { name, skipped: true };
  }

  const filesToWrite = [];
  const dirs = [
    path.join(base, "components"),
    path.join(base, "pages"),
    path.join(base, "service"),
  ];
  dirs.forEach((d) => {
    if (!dryRun) mkdirp(d);
  });

  if (isTS) {
    filesToWrite.push({ path: path.join(base, "type.ts"), content: `// types for ${name}` });
    filesToWrite.push({ path: path.join(base, "validation.ts"), content: `// add form validation (zod/yup) here` });
  } else {
    filesToWrite.push({ path: path.join(base, "validation.js"), content: `// add form validation here` });
  }

  for (const f of filesToWrite) {
    if (dryRun) continue;
    // avoid overwriting unless forced
    if (!force && fs.existsSync(f.path)) continue;
    writeFile(f.path, f.content);
  }

  return { name, created: true };
}

export async function createFeatures(names, opts = {}) {
  const projectPath = process.cwd();
  const isTS = detectTypeScript(projectPath);
  const results = [];
  for (const raw of names) {
    const name = String(raw);
    const res = scaffoldSingleFeature(projectPath, name, isTS, opts);
    results.push(res);
  }
  return { isTS, results };
}
