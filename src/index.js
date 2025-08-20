//  main controller (CLI parsing, prompts fallback, scaffolding)
import { program } from "commander";
import chalk from "chalk";
import { askProjectOptions } from "./prompts.js";
import { scaffoldProject } from "./scaffold.js";

async function run() {
  program
    .name("create-react-scaffold")
    .description("Create a React project with an opinionated scaffold (Vite + Router + ESLint)")
    .argument("[projectName]", "Project directory name")
    .option("-n, --name <name>", "Project directory name (alias of positional)")
    .option("-l, --language <language>", "TypeScript or JavaScript (ts|js)")
    .option("--react-version <version>", "React version to install, e.g. 18, 18.2.0")
    .option("--pm <pm>", "Package manager: npm | pnpm | yarn")
    .option("-y, --yes", "Accept defaults and skip prompts")
    .parse(process.argv);

  const parsed = program.opts();
  const argProject = program.args?.[0];
  const projectName = parsed.name || argProject;
  const language = parsed.language;
  const yes = Boolean(parsed.yes);

  let options = { projectName, language };

  try {
    // If not in non-interactive mode, or any required value missing, prompt
    if (!yes && (!options.projectName || !options.language || !parsed.pm)) {
      const answers = await askProjectOptions({ projectName: options.projectName, language: options.language });
      options = { ...options, ...answers };
    } else {
      // Fill defaults when skipping prompts
      options.projectName = options.projectName || "my-app";
      const lang = (options.language || "TypeScript").toLowerCase();
      options.language = ["typescript", "ts"].includes(lang) ? "TypeScript" : "JavaScript";
    }

    // Pass-through extra options
  if (parsed.reactVersion) options.reactVersion = parsed.reactVersion;
  if (parsed.pm) options.pm = parsed.pm; // npm|pnpm|yarn (optional override)

    await scaffoldProject(options);
  } catch (err) {
    const msg = err && typeof err.message === "string" ? err.message : String(err);
    console.error("\n" + chalk.red("Error:"), msg);
    process.exitCode = 1;
  }
}

run();
