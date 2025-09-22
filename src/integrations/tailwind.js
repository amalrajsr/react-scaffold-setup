import fs from "fs";
import path from "path";
import { run, writeFile, appendFile, mkdirp, log } from "../utils/common.js";

function install(pm, deps, dev = false, cwd) {
  const list = deps.join(" ");
  if (pm === "pnpm") return run(`pnpm add ${dev ? "-D " : ""}${list}`, cwd);
  if (pm === "yarn") return run(`yarn add ${dev ? "-D " : ""}${list}`, cwd);
  return run(`npm install ${dev ? "-D " : ""}${list}`, cwd);
}

export async function integrateTailwind(projectPath, pm) {
  const cfg = path.join(projectPath, "tailwind.config.js");
  const pcfg = path.join(projectPath, "postcss.config.js");
  const pcfgCjs = path.join(projectPath, "postcss.config.cjs");
  const indexCss = path.join(projectPath, "src/index.css");
  const viteConfigs = [
    "vite.config.ts",
    "vite.config.js",
    "vite.config.mts",
    "vite.config.mjs",
  ].map((f) => path.join(projectPath, f));

  // always ensure tailwindcss exists
  install(pm, ["tailwindcss"], true, projectPath);

  // detect installed Tailwind major version (from package.json range)
  let tailwindMajor = 3;
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(projectPath, "package.json"), "utf8"));
    const v = (pkg.devDependencies && pkg.devDependencies.tailwindcss)
      || (pkg.dependencies && pkg.dependencies.tailwindcss) || "";
    const m = String(v).match(/(\d{1,3})/);
    if (m) tailwindMajor = parseInt(m[1], 10) || 3;
  } catch {}

  if (tailwindMajor >= 4) {
    // v4: Prefer the Vite plugin, no PostCSS config needed
    install(pm, ["@tailwindcss/vite"], true, projectPath);

    // Patch vite.config to include the plugin
    const file = viteConfigs.find((p) => fs.existsSync(p));
    if (file) {
      let code = fs.readFileSync(file, "utf8");
      if (!code.includes("@tailwindcss/vite")) {
        // add import
        const importLine = "import tailwindcss from '@tailwindcss/vite'\n";
        // place after first import or at top
        if (code.startsWith("import ")) code = code.replace(/^(import[^\n]*\n)/, `$1${importLine}`);
        else code = importLine + code;
      }
      // ensure plugins array has tailwindcss()
      if (code.includes("plugins:")) {
        // add tailwindcss() if missing inside plugins array
        if (!code.includes("tailwindcss()")) {
          code = code.replace(/plugins:\s*\[/, "plugins: [\n      tailwindcss(), ");
        }
      } else if (code.includes("defineConfig(")) {
        // insert plugins array into defineConfig object
        code = code.replace(/defineConfig\(\{/, `defineConfig({\n  plugins: [\n    tailwindcss(),\n  ],`);
      }
      fs.writeFileSync(file, code);
    }

    // Ensure CSS uses @import "tailwindcss"
  mkdirp(path.dirname(indexCss));
  const importStmt = '@import "tailwindcss";\n';
  // Always overwrite to remove pre-existing styles as requested
  fs.writeFileSync(indexCss, importStmt);

    log("Tailwind v4 integrated with Vite plugin.");
    return { name: "tailwind", ok: true, v: 4 };
  }

  // v3 path: PostCSS + config + directives
  // install postcss/autoprefixer for v3
  install(pm, ["postcss", "autoprefixer"], true, projectPath);

  // init config if missing
  if (!fs.existsSync(cfg) || (!fs.existsSync(pcfg) && !fs.existsSync(pcfgCjs))) {
    const cmd = pm === "pnpm" ? "pnpm dlx tailwindcss init -p" : pm === "yarn" ? "yarn dlx tailwindcss init -p" : "npx tailwindcss init -p";
    try { run(cmd, projectPath); } catch (_) {}
  }

  // ensure content globs
  if (!fs.existsSync(cfg)) writeFile(cfg, `module.exports = { content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"], theme: { extend: {} }, plugins: [] }`);
  else {
    const cur = fs.readFileSync(cfg, "utf8");
    if (!cur.includes("./src/**/*.{js,ts,jsx,tsx}")) {
      const next = cur.replace(/content:\s*\[[^\]]*\]/, 'content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"]');
      fs.writeFileSync(cfg, next);
    }
  }

  // ensure postcss config exists (tailwindcss + autoprefixer)
  const postcssContent = () => `module.exports = {\n  plugins: {\n    tailwindcss: {},\n    autoprefixer: {},\n  },\n};\n`;
  if (!fs.existsSync(pcfg) && !fs.existsSync(pcfgCjs)) {
    writeFile(pcfgCjs, postcssContent());
  }

  // inject directives into index.css
  mkdirp(path.dirname(indexCss));
  const directives = "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n";
  // Always overwrite to remove pre-existing styles as requested
  writeFile(indexCss, directives);

  log("Tailwind integrated.");
  return { name: "tailwind", ok: true };
}
