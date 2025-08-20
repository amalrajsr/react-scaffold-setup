import inquirer from "inquirer";

export async function askProjectOptions() {
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "projectName",
      message: "Enter your project name:",
      default: "my-app",
    },
    {
      type: "list",
      name: "language",
      message: "Choose language:",
      choices: ["TypeScript", "JavaScript"],
      default: "TypeScript",
    },
  ]);

  return answers;
}
