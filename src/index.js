//  main controller (runs prompts, scaffolding)
import { askProjectOptions } from "./prompts.js";
import { scaffoldProject } from "./scaffold.js";

async function run() {
  const options = await askProjectOptions();
  await scaffoldProject(options);
}

run();
