// src/scaffold/helpers.js
import fs from "fs";
import path from "path";
import { appendFile, mkdirp, writeFile } from "../utils/common.js";

export function createFolderStructure(projectPath) {
  const folders = [
    "public",
    "src/assets",
    "src/components/common",
    "src/components/layout",
    "src/components/icons",
    "src/components/ui",
    "src/features",
    "src/hooks",
    "src/lib",
    "src/routes",
  ];
  folders.forEach((rel) => mkdirp(path.join(projectPath, rel)));
}

export function scaffoldAppShell(projectPath, isTS, ext) {
  // App
  writeFile(
    path.join(projectPath, `src/App.${ext}`),
    `
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";

export default function App() {
  return <RouterProvider router={router} />;
}
`.trimStart()
  );
  // Router
  writeFile(
    path.join(projectPath, `src/routes/index.${ext}`),
    `
import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import ExamplePage from "../features/example/pages/ExamplePage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <ExamplePage /> }
    ]
  }
]);
`.trimStart()
  );
  // Layouts
  writeFile(
    path.join(projectPath, `src/components/layout/Header.${ext}`),
    `
export default function Header() {
  return (
    <header style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #eaeaea" }}>
      <strong>Header</strong>
    </header>
  );
}
`.trimStart()
  );
  writeFile(
    path.join(projectPath, `src/components/layout/Footer.${ext}`),
    `
export default function Footer() {
  return (
    <footer style={{ padding: "0.75rem 1rem", borderTop: "1px solid #eaeaea", marginTop: "2rem" }}>
      <small>Footer</small>
    </footer>
  );
}
`.trimStart()
  );
  writeFile(
    path.join(projectPath, `src/components/layout/MainLayout.${ext}`),
    `
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function MainLayout() {
  return (
    <>
      <Header />
      <main style={{ padding: "1rem" }}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
`.trimStart()
  );
}

export function scaffoldUIComponents(projectPath, isTS, ext, projectName) {
  // Card
  writeFile(
    path.join(projectPath, `src/components/common/Card.${ext}`),
    (
      isTS
        ? `
import type { ReactNode } from "react";

type CardProps = { children?: ReactNode };

export default function Card({ children }: CardProps) {
  return (
    <div style={{ padding: "1rem", border: "1px solid #ddd", borderRadius: 8 }}>
      {children}
    </div>
  );
}
`.trimStart()
        : `
export default function Card({ children }) {
  return (
    <div style={{ padding: "1rem", border: "1px solid #ddd", borderRadius: 8 }}>
      {children}
    </div>
  );
}
`.trimStart()
    )
  );
  // Button
  writeFile(
    path.join(projectPath, `src/components/ui/Button.${ext}`),
    (
      isTS
        ? `
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { children?: ReactNode };

export default function Button({ children, ...rest }: ButtonProps) {
  return <button {...rest}>{children}</button>;
}
`.trimStart()
        : `
export default function Button(props) {
  const { children, ...rest } = props;
  return <button {...rest}>{children}</button>;
}
`.trimStart()
    )
  );
  // Input
  writeFile(
    path.join(projectPath, `src/components/ui/Input.${ext}`),
    (
      isTS
        ? `
import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export default function Input(props: InputProps) {
  return <input {...props} />;
}
`.trimStart()
        : `
export default function Input(props) {
  return <input {...props} />;
}
`.trimStart()
    )
  );
  // LogoIcon
  writeFile(
    path.join(projectPath, `src/components/icons/LogoIcon.${ext}`),
    (
      isTS
        ? `
import type { SVGProps } from "react";

export default function LogoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" {...props}>
      <circle cx="12" cy="12" r="10" fill="currentColor" />
    </svg>
  );
}
`.trimStart()
        : `
export default function LogoIcon(props) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" {...props}>
      <circle cx="12" cy="12" r="10" fill="currentColor" />
    </svg>
  );
}
`.trimStart()
    )
  );
  // Lib constants uses projectName
  writeFile(
    path.join(projectPath, `src/lib/constants.${isTS ? "ts" : "js"}`),
    `export const APP_NAME = "${projectName}";`
  );
}

export function scaffoldFeatureExample(projectPath, isTS, ext) {
  mkdirp(path.join(projectPath, "src/features/example/components"));
  mkdirp(path.join(projectPath, "src/features/example/pages"));
  mkdirp(path.join(projectPath, "src/features/example/service"));
  writeFile(
    path.join(projectPath, `src/features/example/pages/ExamplePage.${ext}`),
    `
import Card from "../../../components/common/Card";

export default function ExamplePage() {
  return (
    <Card>
      <h1>Welcome to the example feature 🚀</h1>
      <p>Replace this with your real feature pages.</p>
    </Card>
  );
}
`.trimStart()
  );
  writeFile(
    path.join(projectPath, `src/features/example/service/exampleService.${isTS ? "ts" : "js"}`),
    `
export async function getExample() {
  return { ok: true };
}
`.trimStart()
  );
  if (isTS) {
    writeFile(
      path.join(projectPath, "src/features/example/type.ts"),
      `export type Example = { id: string; name: string };`
    );
    writeFile(
      path.join(projectPath, "src/features/example/validation.ts"),
      `// add zod/yup schemas here when needed`
    );
  } else {
    writeFile(
      path.join(projectPath, "src/features/example/validation.js"),
      `// add your validation utilities here when needed`
    );
  }
}

export function scaffoldHooksAndLib(projectPath, isTS) {
  // Hook
  writeFile(
    path.join(projectPath, `src/hooks/useDebounce.${isTS ? "ts" : "js"}`),
    isTS
      ? `
import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
`.trimStart()
      : `
import { useEffect, useState } from "react";

export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
`.trimStart()
  );
  // Lib
  writeFile(
    path.join(projectPath, `src/lib/axios.${isTS ? "ts" : "js"}`),
    `
/** Configure axios here if you use it in your projects
import axios from "axios";
export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });
api.interceptors.response.use((r) => r, (e) => Promise.reject(e));
*/
`.trimStart()
  );
  writeFile(
    path.join(projectPath, `src/lib/toast.${isTS ? "ts" : "js"}`),
    `// configure your toast library of choice here`
  );
}

export function ensureIndexCss(projectPath) {
  const indexCssPath = path.join(projectPath, "src/index.css");
  if (!fs.existsSync(indexCssPath)) {
    writeFile(indexCssPath, `/* global styles */`);
  }
}

export function ensureGlobalTypes(projectPath, isTS) {
  if (!isTS) return;
  const globalType = path.join(projectPath, "src/type.ts");
  if (!fs.existsSync(globalType)) {
    writeFile(globalType, `// shared global types`);
  }
}

export function writeEslintConfigFile(projectPath, isTS, isModernReact) {
  writeFile(
    path.join(projectPath, ".eslintrc.json"),
    JSON.stringify(
      isTS
        ? {
            env: { browser: true, es2021: true },
            extends: [
              "eslint:recommended",
              "plugin:react/recommended",
              "plugin:react-hooks/recommended",
              "plugin:@typescript-eslint/recommended",
            ],
            parser: "@typescript-eslint/parser",
            parserOptions: {
              ecmaFeatures: { jsx: true },
              ecmaVersion: "latest",
              sourceType: "module",
            },
            plugins: ["react", "react-hooks", "@typescript-eslint"],
            rules: {
              "react/react-in-jsx-scope": isModernReact ? "off" : "error",
            },
            settings: { react: { version: "detect" } },
          }
        : {
            env: { browser: true, es2021: true },
            extends: [
              "eslint:recommended",
              "plugin:react/recommended",
              "plugin:react-hooks/recommended",
            ],
            parserOptions: {
              ecmaFeatures: { jsx: true },
              ecmaVersion: "latest",
              sourceType: "module",
            },
            plugins: ["react", "react-hooks"],
            rules: {
              "react/react-in-jsx-scope": isModernReact ? "off" : "error",
            },
            settings: { react: { version: "detect" } },
          },
      null,
      2
    )
  );
}

// flat config writer removed; sticking to eslintrc JSON for compatibility
// flat config writer intentionally omitted (using eslintrc JSON)

export function writeEnvFiles(projectPath) {
  writeFile(path.join(projectPath, ".env"), `# environment variables\nVITE_API_URL=\n`);
  writeFile(path.join(projectPath, ".env.sample"), `VITE_API_URL=https://api.example.com`);
}

export function writeDocsFiles(projectPath, isTS, ext, projectName, isModernReact) {
  writeFile(
    path.join(projectPath, "SETUP.md"),
    `
# Setup

## Install & Run
\`\`\`bash
npm install
npm run dev
\`\`\`

## Folder Structure (src)
- assets/         → images, videos, etc.
- components/
  - common/       → shared components used across 2-3 features (e.g., Card)
  - layout/       → Header, Footer, MainLayout
  - icons/        → SVG components
  - ui/           → UI primitives (Button, Input, Modal, etc.)
- features/       → feature modules (e.g., chat, blog)
  - <feature>/components
  - <feature>/pages
  - <feature>/service
  - <feature>/type.ts (TS only)
  - <feature>/validation.ts
- hooks/          → global hooks (e.g., useDebounce)
- lib/            → axios config, toast config, constants
- routes/         → router definition (Data Router API)
- App.${ext}      → renders RouterProvider
- index.css       → global styles
${isTS ? "- type.ts        → global TS types" : ""}
`.trimStart()
  );
  appendFile(
    path.join(projectPath, "README.md"),
    `
## Created with create-react-scaffold

- React + Vite
- ${isTS ? "TypeScript" : "JavaScript"}
- React Router (Data Router API)
- ESLint (.eslintrc.json; JSX scope rule ${isModernReact ? "off for React 18+" : "enforced for <18"})
- Opinionated folder structure
`.trimStart()
  );
}

export function writeTSConfigs(projectPath) {
  const tsApp = path.join(projectPath, "tsconfig.app.json");
  const tsNode = path.join(projectPath, "tsconfig.node.json");
  if (!fs.existsSync(tsApp)) {
    writeFile(
      tsApp,
      JSON.stringify(
        {
          compilerOptions: {
            target: "ES2020",
            lib: ["ES2020", "DOM", "DOM.Iterable"],
            jsx: "react-jsx",
            module: "ESNext",
            moduleResolution: "Bundler",
            strict: true,
            skipLibCheck: true,
            noEmit: true,
            isolatedModules: true,
            allowSyntheticDefaultImports: true,
            esModuleInterop: true,
            resolveJsonModule: true,
            noUncheckedIndexedAccess: true,
          },
          include: ["src"],
        },
        null,
        2
      )
    );
  }
  if (!fs.existsSync(tsNode)) {
    writeFile(
      tsNode,
      JSON.stringify(
        {
          compilerOptions: {
            target: "ES2020",
            lib: ["ES2020"],
            module: "ESNext",
            moduleResolution: "Bundler",
            types: ["node"],
            allowSyntheticDefaultImports: true,
            esModuleInterop: true,
          },
          include: ["vite.config.ts"],
        },
        null,
        2
      )
    );
  }
}

export function fixMainEntry(projectPath, isTS, isModernReact) {
  const mainPath = path.join(projectPath, `src/main.${isTS ? "tsx" : "jsx"}`);
  if (!fs.existsSync(mainPath)) return; // Vite created it

  let content;
  if (isModernReact) {
    content = isTS
      ? `
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`.trimStart()
      : `
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`.trimStart();
  } else {
    // React 17 fallback (no createRoot)
    content = isTS
      ? `
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./index.css";

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")!
);
`.trimStart()
      : `
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./index.css";

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
`.trimStart();
  }

  fs.writeFileSync(mainPath, content);
}

export function addLintScripts(projectPath) {
  try {
    const pkgPath = path.join(projectPath, "package.json");
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
      pkg.scripts = pkg.scripts || {};
      if (!pkg.scripts.lint) pkg.scripts.lint = "eslint .";
      if (!pkg.scripts["lint:fix"]) pkg.scripts["lint:fix"] = "eslint . --fix";
      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
    }
  } catch (_) {
    // ignore package.json script update failures
  }
}

export function removeViteSamples(projectPath) {
  const files = [
    path.join(projectPath, "src/App.css"),
    path.join(projectPath, "src/assets/react.svg"),
    path.join(projectPath, "public/vite.svg"),
  ];
  for (const p of files) {
    try {
      if (fs.existsSync(p)) fs.unlinkSync(p);
    } catch (_) {
      // ignore
    }
  }
  // remove empty assets dir
  const assetsDir = path.join(projectPath, "src/assets");
  try {
    if (fs.existsSync(assetsDir) && fs.readdirSync(assetsDir).length === 0) {
      fs.rmdirSync(assetsDir);
    }
  } catch (_) {
    // ignore
  }
}
