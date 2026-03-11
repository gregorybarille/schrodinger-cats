# AGENTS.md — Schrödinger's Cats

Guidance for agentic coding agents working in this repository.

---

## Project Overview

A browser-based probability calculator for the card game "Schrödinger's Cats". It computes hypergeometric distribution probabilities to help players evaluate bids. Built as a React 19 SPA deployed to GitHub Pages.

**Stack:** React 19 · Vite 6 · TypeScript ~5.6 (strict) · Tailwind CSS v3 · Radix UI · shadcn/ui pattern · @tabler/icons-react

---

## Commands

```bash
# Development server (hot reload)
npm run dev

# Type-check + production build
npm run build

# Run ESLint
npm run lint

# Preview production build locally
npm run preview
```

**There is no test runner configured.** No Jest, Vitest, or any test framework is installed. Do not attempt to run tests or add a test runner without being explicitly asked.

**There is no Prettier configured.** Do not add a `.prettierrc` or run `prettier` unless explicitly asked.

To type-check without building:
```bash
npx tsc --noEmit
```

---

## Repository Structure

```
src/
  components/
    ui/           # shadcn/ui base primitives (button, card, input, etc.)
    *.tsx         # Feature components (GameScreen, BidDisplay, etc.)
  lib/
    gameLogic.ts  # Core probability engine — hypergeometric math, types, bid sequence
    utils.ts      # cn() helper (clsx + tailwind-merge)
  App.tsx         # Root component, top-level state (single screen)
  main.tsx        # Entry point
  index.css       # Tailwind directives + CSS custom property theme
index.html
vite.config.ts
tsconfig.json
tailwind.config.js
```

---

## TypeScript

- **Strict mode is enabled**: `strict`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch` are all `true`. Every piece of code must satisfy these constraints.
- Target: `ES2020`. Module system: `ESNext` with `moduleResolution: "bundler"`.
- Path alias: `@/` resolves to `src/`. Use it for imports that cross directory boundaries.
- `noEmit: true` — the build is handled by Vite, not `tsc` directly.
- Never use `any` unless there is a compelling reason and it cannot be avoided.
- Prefer `interface` over `type` for object shapes. Use `type` for union literals and aliases.

---

## Code Style

### Imports

- Single quotes throughout — no double quotes in `.ts`/`.tsx` files.
- Use the `@/` alias for imports from a different directory:
  ```ts
  import { cn } from '@/lib/utils'
  import { GameState, Bid } from '@/lib/gameLogic'
  ```
- Use relative imports for siblings in the same directory:
  ```ts
  import { CardCounter } from './CardCounter'
  ```
- Named imports from React (never `import React from 'react'`):
  ```ts
  import { useState, useCallback } from 'react'
  ```

### Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Components | `PascalCase` | `GameScreen`, `BidInput` |
| Component files | `PascalCase.tsx` | `GameScreen.tsx` |
| Logic/util modules | `camelCase.ts` | `gameLogic.ts`, `utils.ts` |
| Interfaces | `PascalCase` | `GameState`, `DeckConfig` |
| Prop interfaces | `ComponentNameProps` | `GameScreenProps` |
| Union type aliases | `PascalCase` | `CardType` |
| Event handler props | `onXxx` | `onChange`, `onReset`, `onStartGame` |
| Constants (lookup) | `camelCase` | `typeConfig`, `typeLabel` |
| Top-level immutable maps | `camelCase` or `SCREAMING_SNAKE_CASE` | `DEFAULT_DECK` |

### Components

- **Named exports only** for all components. Default exports are only used in `App.tsx` and `main.tsx`.
  ```ts
  // correct
  export function GameScreen({ ... }: GameScreenProps) { ... }

  // incorrect
  export default function GameScreen() { ... }
  ```
- Define the props interface directly above the component function.
- Destructure props in the function signature, not inside the body.
- Use `React.forwardRef` only for base UI primitives in `src/components/ui/`.

### Styling

- Use Tailwind utility classes inline on JSX elements.
- Always use the `cn()` utility from `@/lib/utils` when classes are conditional or merged:
  ```ts
  import { cn } from '@/lib/utils'
  className={cn('base-class', condition && 'conditional-class', className)}
  ```
- In `src/components/ui/` (shadcn primitives): use semantic CSS variable tokens (`text-muted-foreground`, `bg-background`, `border-border`).
- In feature components: raw Tailwind color classes are acceptable (`text-green-700`, `bg-purple-50`).
- No CSS modules, no styled-components, no inline `style` objects unless absolutely necessary.

### Logic & Math

- The core probability engine lives in `src/lib/gameLogic.ts`. Keep pure math functions out of components.
- Clamp probability values: `Math.min(1, Math.max(0, prob))`.
- Use `??` (nullish coalescing) over `||` when the fallback should only apply to `null`/`undefined`.

### Error Handling

- This app has no async operations, network calls, or I/O. There are no try/catch blocks and no error boundaries — keep it that way unless introducing new async behavior.
- Use defensive checks on math inputs (e.g., guard against division by zero, negative counts) rather than throwing exceptions.

---

## Path Alias

`@/` is configured in both `tsconfig.json` and `vite.config.ts` to resolve to `./src`. Always use this alias instead of relative paths like `../../lib/utils`.

---

## CI/CD

- **Deploy target:** GitHub Pages at `https://<user>.github.io/schrodinger-cats/`
- **Trigger:** push to `main`, or manual workflow dispatch
- **Build:** `npm ci` → `npm run build` (`tsc -b && vite build`) → upload `dist/`
- The `base: '/schrodinger-cats/'` in `vite.config.ts` must remain for assets to load correctly on GitHub Pages.
- PRs are not automatically deployed; only `main` deploys.

---

## Key Constraints

- Do not add a router; this is intentionally a single-screen SPA (game setup vs. game play is managed with local state in `App.tsx`).
- Do not add a backend or any network requests.
- Do not remove the `base` path from `vite.config.ts`.
- All TypeScript errors and all ESLint errors must be resolved before committing — the build will fail otherwise.
- Keep the `@/` alias consistent; do not introduce long relative import chains.
