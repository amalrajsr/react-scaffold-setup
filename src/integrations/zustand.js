import { run, log } from "../utils/common.js";

function install(pm, deps, dev = false, cwd) {
  const list = deps.join(" ");
  if (pm === "pnpm") return run(`pnpm add ${dev ? "-D " : ""}${list}`, cwd);
  if (pm === "yarn") return run(`yarn add ${dev ? "-D " : ""}${list}`, cwd);
  return run(`npm install ${dev ? "-D " : ""}${list}`, cwd);
}

export async function integrateZustand(projectPath, pm) {
  install(pm, ["zustand"], false, projectPath);
  log("Zustand integrated.");
  return { name: "zustand", ok: true };
}
