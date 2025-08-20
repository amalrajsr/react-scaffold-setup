import inquirer from "inquirer";

export async function askProjectOptions(initial = {}) {
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "projectName",
      message: "Enter your project name:",
      default: initial.projectName || "my-app",
      validate: (input) => {
        if (!input || !input.trim()) return "Project name is required";
        // Basic npm package name validation
        const name = input.trim();
        if (name.length > 214) return "Name too long";
        if (/^[.]{1,2}$/.test(name)) return "Name cannot be '.' or '..'";
        if (/[^a-z0-9-_.@]/.test(name)) return "Use lowercase letters, numbers, hyphens, underscores, dots, or @";
        return true;
      },
    },
    {
      type: "list",
      name: "language",
      message: "Choose language:",
      choices: [
        { name: "TypeScript", value: "TypeScript" },
        { name: "JavaScript", value: "JavaScript" },
      ],
      default: initial.language || "TypeScript",
    },
    {
      type: "list",
      name: "pm",
      message: "Select a package manager:",
      choices: [
        { name: "npm", value: "npm" },
        { name: "pnpm", value: "pnpm" },
        { name: "yarn", value: "yarn" },
      ],
      default: detectDefaultPM(),
    },
  ]);

  return answers;
}

function detectDefaultPM() {
  const ua = process.env.npm_config_user_agent || "";
  if (ua.includes("pnpm")) return "pnpm";
  if (ua.includes("yarn")) return "yarn";
  return "npm";
}
