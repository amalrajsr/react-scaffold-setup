# create-my-react

Scaffold a modern React app with Vite, React Router, ESLint, and an opinionated folder structure from a single CLI. Includes a post-setup command to generate feature modules on demand.

## Features
- Vite + React (TypeScript or JavaScript)
- React Router (Data Router API) wired into `App`
- Opinionated, scalable folder layout under `src`
- ESLint configured out of the box
- Environment files: `.env`, `.env.sample`
- Docs: `SETUP.md` and a project `README` entry
- Post-setup command to generate feature folders

## Requirements
- Node.js >= 20
- npm, pnpm, or yarn (detected automatically; can be overridden)

## Quickstart
Create a new project interactively:

```sh
npx create-react-scaffold
```

Non-interactive, TypeScript with npm:

```sh
npx create-react-scaffold my-app -l TypeScript --pm npm -y
```

JavaScript with pnpm:

```sh
npx create-react-scaffold my-app -l js --pm pnpm -y
```

After scaffold:

```sh
cd "my-app"
npm run dev   # or pnpm dev / yarn dev
```

## What gets created
Inside your project:

```
src/
  assets/
  components/
    common/
    layout/
    icons/
    ui/
  features/
    example/
      components/
      pages/
      service/
      type.ts        # TS only
      validation.ts  # TS only (JS uses validation.js)
  hooks/
  lib/
  routes/
  App.(tsx|jsx)
  index.css
  type.ts           # TS only (global types)
```

- Router is configured in `src/routes/index.(tsx|jsx)` and rendered from `App`.
- ESLint config is written as `.eslintrc.json`.
- `.env` and `.env.sample` are created.

## CLI reference

### Project creation (root command)
```
create-react-scaffold [projectName] [options]
```
Options:
- `-n, --name <name>`: Project directory name (alias of positional)
- `-l, --language <language>`: TypeScript or JavaScript (accepts `TypeScript`, `JavaScript`, `ts`, `js`)
- `--react-version <version>`: React version to install (e.g., `18`, `18.2.0`); if omitted uses latest
- `--pm <pm>`: Package manager: `npm | pnpm | yarn`
- `-y, --yes`: Accept defaults and skip prompts

Examples:
```sh
# Interactive
npx create-react-scaffold

# Non-interactive TS with yarn
npx create-react-scaffold my-app -l ts --pm yarn -y

# Request a specific React version
npx create-react-scaffold my-app --react-version 18.2.0 -l ts -y
```

Notes:
- The CLI prevents scaffolding into a non-empty existing directory.
- Package manager is detected from your environment if not provided.

### Feature generator (post-setup)
Run from inside an existing project (where `src` exists):

```
create-react-scaffold feature <names...> [options]
```
Options:
- `-f, --force`: Overwrite existing files/folders
- `--dry-run`: Preview without writing files

Behavior:
- Auto-detects project language (TS if `tsconfig*.json` or `src/main.tsx` exists).
- Creates, per feature name:
  - `src/features/<name>/components/`
  - `src/features/<name>/pages/`
  - `src/features/<name>/service/`
  - `src/features/<name>/type.ts` (TS only)
  - `src/features/<name>/validation.ts` (TS) or `validation.js` (JS)
- Safe by default: won’t overwrite unless `--force`.

Examples:
```sh
# Create two features
npx create-react-scaffold feature chat blog

# Overwrite existing
npx create-react-scaffold feature chat -f

# Dry run
npx create-react-scaffold feature chat --dry-run
```

## Troubleshooting
- If npm prints peer/deprecation warnings during ESLint install, the scaffold still completes and ESLint runs. You can update tooling later as versions evolve; this CLI favors compatibility with fresh Vite templates.
- On Windows, keep quotes around paths or names with spaces: `cd "My App"`.

## Contributing
Issues and PRs welcome. Please open an issue to discuss substantial changes first.

## License
This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
