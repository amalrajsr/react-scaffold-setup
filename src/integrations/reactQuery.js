import fs from "fs";
import path from "path";
import { run, writeFile, log } from "../utils/common.js";

function install(pm, deps, dev = false, cwd) {
  const list = deps.join(" ");
  if (pm === "pnpm") return run(`pnpm add ${dev ? "-D " : ""}${list}`, cwd);
  if (pm === "yarn") return run(`yarn add ${dev ? "-D " : ""}${list}`, cwd);
  return run(`npm install ${dev ? "-D " : ""}${list}`, cwd);
}

export async function integrateReactQuery(projectPath, pm, reactMajor) {
  // install deps: v4 supports React 17; v5+ for React 18+
  const pkg = reactMajor && Number(reactMajor) < 18
    ? "@tanstack/react-query@^4"
    : "@tanstack/react-query";
  install(pm, [pkg], false, projectPath);

  // patch src/main entry with QueryClientProvider if not present
  const srcDir = path.join(projectPath, "src");
  const candidates = ["main.tsx", "main.jsx", "main.ts", "main.js"]
    .map((f) => path.join(srcDir, f))
    .filter((p) => fs.existsSync(p));
  if (candidates.length === 0) return { name: "react-query", ok: true, note: "no main entry found" };

  const main = candidates[0];
  let code = fs.readFileSync(main, "utf8");
  if (code.includes("QueryClientProvider")) return { name: "react-query", ok: true };

  // simple injection: wrap <RouterProvider /> or <App />
  const importLine = "import { QueryClient, QueryClientProvider } from '@tanstack/react-query';\n";
  if (!code.includes("@tanstack/react-query")) {
    // insert import after first import if present, else at top
    if (code.startsWith("import ")) code = code.replace(/^(import[^\n]*\n)/, `$1${importLine}`);
    else code = importLine + code;
  }
  // ensure a single queryClient instance
  if (!/const\s+queryClient\s*=\s*new\s+QueryClient\(\)/.test(code)) {
    // insert after imports block
    const importBlockMatch = code.match(/^(?:import[^\n]*\n)+/);
    if (importBlockMatch) {
      const end = importBlockMatch[0];
      code = code.replace(end, end + "\nconst queryClient = new QueryClient();\n\n");
    } else {
      code = `const queryClient = new QueryClient();\n` + code;
    }
  }

  const providerOpen = "<QueryClientProvider client={queryClient}>";
  const providerClose = "</QueryClientProvider>";

  if (code.includes("<React.StrictMode>")) {
    // Safest path: nest provider inside StrictMode
    code = code.replace(
      /<React\.StrictMode>/,
      `<React.StrictMode>\n    ${providerOpen}`
    );
    code = code.replace(
      /<\/React\.StrictMode>/,
      `    ${providerClose}\n  </React.StrictMode>`
    );
  } else if (code.includes("<RouterProvider")) {
    code = code.replace(/(<RouterProvider[^>]*\/>)/, `${providerOpen}\n    $1\n    ${providerClose}`);
    code = code.replace(/(<RouterProvider[^>]*>)/, `${providerOpen}\n    $1`);
    code = code.replace(/(<\/RouterProvider>)/, `$1\n    ${providerClose}`);
  } else if (code.includes("<App")) {
    // wrap self-closing <App /> or open/close pair
    if (/\<App[^>]*\/\>/.test(code)) {
      code = code.replace(/<App([^>]*)\/>/, `${providerOpen}\n    <App$1/>\n    ${providerClose}`);
    } else {
      code = code.replace(/<App([^>]*)>/, `${providerOpen}\n    <App$1>`);
      code = code.replace(/<\/App>/, `</App>\n    ${providerClose}`);
    }
  } else {
    // fallback: wrap render argument start/end
    code = code.replace(/render\(\s*</, `render(\n  ${providerOpen}\n  <`);
    code = code.replace(/\)\s*;\s*$/, `\n  ${providerClose}\n);`);
  }

  fs.writeFileSync(main, code);
  log("React Query integrated.");
  return { name: "react-query", ok: true };
}
