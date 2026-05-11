# react-scaffold-setup

Scaffold a modern React app with Vite, React Router, ESLint, and an opinionated folder structure from a single CLI. Includes a post-setup command to generate feature modules on demand, plus optional integrations you can add at any time.

## Features
- Vite + React (TypeScript or JavaScript)
- React Router (Data Router API) wired into `App`
- Opinionated, scalable folder layout under `src`
- ESLint configured out of the box
- Environment files: `.env`, `.env.sample`
- Docs: `SETUP.md` and a project `README` entry
- Post-setup command to generate feature folders
- Optional integrations via `add`: Tailwind CSS, React Query, Zustand, Axios

## Requirements
- Node.js >= 20
- npm, pnpm, or yarn (detected automatically; can be overridden)

## Quickstart
Create a new project interactively (no install required):

```sh
npx react-scaffold-setup
```

Prefer a global install? Then the CLI is available as `create-react-scaffold`:

```sh
npm i -g react-scaffold-setup
create-react-scaffold
```

Non-interactive, TypeScript with npm:

```sh
npx react-scaffold-setup my-app -l TypeScript --pm npm -y
```

JavaScript with pnpm:

```sh
npx react-scaffold-setup my-app -l js --pm pnpm -y
```

After scaffold:

```sh
cd "my-app"
npm run dev   # or pnpm dev / yarn dev
```

Add integrations (optional):

```sh
# Add Tailwind + Zustand + Axios + React Query
npx react-scaffold-setup add tailwind zustand axios react-query

# Or add a subset at any time
npx react-scaffold-setup add tailwind react-query
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
- ESLint uses the flat config (`eslint.config.js`) provided by the Vite template.
- `.env` and `.env.sample` are created.

## CLI reference

### Project creation (root command)
```
npx react-scaffold-setup [projectName] [options]
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
npx react-scaffold-setup

# Non-interactive TS with yarn
npx react-scaffold-setup my-app -l ts --pm yarn -y

# Request a specific React version
npx react-scaffold-setup my-app --react-version 18.2.0 -l ts -y
```

Notes:
- The CLI prevents scaffolding into a non-empty existing directory.
- Package manager is detected from your environment if not provided.

### Feature generator (post-setup)
Run from inside an existing project (where `src` exists):

```
npx react-scaffold-setup feature <names...> [options]
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
npx react-scaffold-setup feature chat blog

# Overwrite existing
npx react-scaffold-setup feature chat -f

# Dry run
npx react-scaffold-setup feature chat --dry-run
```

### Add integrations (post-setup)
Run from inside an existing project (where `src` exists):

```
npx react-scaffold-setup add [integrations...]
```
Supported integrations:
- `tailwind` — Tailwind CSS
- `react-query` (aliases: `reactquery`, `tanstack`) — @tanstack/react-query
- `zustand` — Zustand state library
- `axios` — Axios HTTP client

Behavior:
- You can provide multiple integrations in one command; they’ll be applied in a safe, idempotent way.
- The CLI auto-detects your package manager (npm/pnpm/yarn) and your React major version when needed.
- Tailwind v4 uses the official Vite plugin and `@import "tailwindcss";` in `src/index.css` (overwrites existing styles).
- For older projects on Tailwind v3, falls back to PostCSS config and the `@tailwind base/components/utilities` directives.

Examples:
```sh
# Everything at once
npx react-scaffold-setup add tailwind zustand axios react-query

# Just Tailwind
npx react-scaffold-setup add tailwind

# React 17 projects are supported; React Query v4 will be used automatically.
```

## Troubleshooting
- If npm prints peer/deprecation warnings during ESLint install, the scaffold still completes and ESLint runs. You can update tooling later as versions evolve; this CLI favors compatibility with fresh Vite templates.
- On Windows, keep quotes around paths or names with spaces: `cd "My App"`.
- Tailwind v4: If you previously added a PostCSS config with `tailwindcss` listed as a plugin, remove it when using the Vite plugin flow; the integration writes `@import "tailwindcss";` into `src/index.css` and updates `vite.config.*` to include `@tailwindcss/vite`.

## Contributing
Issues and PRs welcome. Please open an issue to discuss substantial changes first.

## License
This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
