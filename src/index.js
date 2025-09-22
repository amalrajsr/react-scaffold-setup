//  main controller (CLI parsing, prompts fallback, scaffolding)
import { program } from "commander";
import chalk from "chalk";
import { askProjectOptions } from "./prompts.js";
import { scaffoldProject } from "./scaffold.js";
import { createFeatures } from "./feature.js";
import { applyIntegrations } from "./integrations/index.js";

async function run() {
  // Root command (project creation)
  program
    .name("create-react-scaffold")
    .description("Create a React project with an opinionated scaffold (Vite + Router + ESLint)")
    .argument("[projectName]", "Project directory name")
    .option("-n, --name <name>", "Project directory name (alias of positional)")
    .option("-l, --language <language>", "TypeScript or JavaScript (ts|js)")
    .option("--react-version <version>", "React version to install, e.g. 18, 18.2.0")
    .option("--pm <pm>", "Package manager: npm | pnpm | yarn")
    .option("-y, --yes", "Accept defaults and skip prompts")
    .action(async (argProjectName, opts) => {
      const yes = Boolean(opts.yes);
      let options = { projectName: opts.name || argProjectName, language: opts.language };
      try {
        if (!yes && (!options.projectName || !options.language || !opts.pm)) {
          const answers = await askProjectOptions({ projectName: options.projectName, language: options.language });
          options = { ...options, ...answers };
        } else {
          options.projectName = options.projectName || "my-app";
          const lang = (options.language || "TypeScript").toLowerCase();
          options.language = ["typescript", "ts"].includes(lang) ? "TypeScript" : "JavaScript";
        }

        if (opts.reactVersion) options.reactVersion = opts.reactVersion;
        if (opts.pm) options.pm = opts.pm; // npm|pnpm|yarn

        await scaffoldProject(options);
      } catch (err) {
        const msg = err && typeof err.message === "string" ? err.message : String(err);
        console.error("\n" + chalk.red("Error:"), msg);
        process.exitCode = 1;
      }
    });

  // Subcommand: feature scaffolding
  program
    .command("feature [names...]")
    .description("Create one or more feature folders under src/features")
    .option("-f, --force", "Overwrite existing files/folders", false)
    .option("--dry-run", "Preview without writing files", false)
    .action(async (names = [], cmd) => {
      try {
        if (!names.length) throw new Error("Provide at least one feature name");
        const { isTS, results } = await createFeatures(names, { force: cmd.force, dryRun: cmd.dryRun });
        console.log(`\nLanguage detected: ${isTS ? "TypeScript" : "JavaScript"}`);
        results.forEach((r) => {
          if (r.skipped) console.log(`- Skipped ${r.name} (exists)`);
          else console.log(`- Created ${r.name}`);
        });
      } catch (err) {
        const msg = err && typeof err.message === "string" ? err.message : String(err);
        console.error("\n" + chalk.red("Error:"), msg);
        process.exitCode = 1;
      }
    });

  // Subcommand: add integrations
  program
    .command("add [integrations...]")
    .description("Add integrations to an existing project (tailwind, react-query, zustand, axios)")
    .option("-C, --cwd <dir>", "Target project directory (defaults to current dir)")
    .action(async (integrations = [], cmd) => {
      try {
        if (!integrations.length) throw new Error("Provide at least one integration (e.g., tailwind axios)");
        const target = cmd.cwd || process.cwd();
        const results = await applyIntegrations(target, integrations, {});
        console.log("\nIntegrations applied:");
        results.forEach((r) => console.log(`- ${r.name}: ${r.ok ? "ok" : "failed"}${r.note ? ` (${r.note})` : ""}`));
      } catch (err) {
        const msg = err && typeof err.message === "string" ? err.message : String(err);
        console.error("\n" + chalk.red("Error:"), msg);
        process.exitCode = 1;
      }
    });

  program.parse(process.argv);
}

run();
