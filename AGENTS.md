# AGENTS.md

Guidance for AI coding agents working in this repository.

## Project overview

Draconis is a simple single-player, browser-based old-school RPG built with Angular.
It features a simple turn-based combat system, between a party of characters and a group of enemies.
It's a hobby project used to experiment with frontend tech, so favor simple, readable, pragmatic code over enterprise patterns.
There is no linter configured (no ESLint/Prettier). Match the existing code style instead.

## Tech stack

- Angular 21 (standalone components, no `NgModule`)
- TypeScript, strict mode enabled (`tsconfig.json`)
- Tailwind CSS for styling (utility classes directly in templates)
- Karma + Jasmine for unit tests
- No backend, no network calls, no auth, everything runs client-side

## Common commands

```bash
npm start          # ng serve, dev server on http://localhost:4200
npm run build      # production build to dist/draconis
npm run watch      # dev build with --watch
npm test           # ng test (Karma/Jasmine)
```

## Code structure

- `src/app/model/`: plain TypeScript classes with no Angular dependencies: game state, creatures,
  characters, enemies, skills, statuses, items, fight logic. This is the domain model and the
  bulk of the game's logic and content (e.g. `character.model.ts` defines character classes and
  their skill loadouts, `skill.model.ts` defines skill behaviors).
- `src/app/fight/`: the fight feature: `FightComponent`/`FightService` orchestrate combat, with
  subcomponents (`character/`, `enemy/`, `status/`, `message/`, `class-icon/`, `life-change-popup/`).
- `src/app/util/`: small standalone helpers (e.g. `log.ts`).
- `src/app/app.component.ts`: root component.
- `doc/`: PlantUML diagrams (`model-enemy.puml`, `model-world.puml`) and a screenshot.
- `mockups/`: ignore

## Conventions

- Standalone components only: `@Component({ selector, imports: [...], templateUrl })`, no modules.
- Single quotes for strings, 2-space indentation (enforced by `.editorconfig`).
- Imports use single-quoted, non-spaced braces (e.g. `import {Component} from '@angular/core';`).
- Prefer template control flow (`@if`, `@for`, `@switch`) over `*ngIf`/`*ngFor` in new templates;
  always provide a `track` expression for `@for`.
- Domain classes in `model/` are plain TS classes (not Angular services/injectables) — keep game
  logic there, independent of Angular. Angular services (e.g. `FightService`) wire the model into components.
- Styling is done with Tailwind utility classes directly in HTML templates rather than component CSS files.
- Existing `// TODO FBE ...` comments mark known follow-up work — don't feel obligated to fix
  them unless asked, but keep the style if adding your own similarly-scoped TODOs.
- JSDoc-style `/** ... */` comments are used sparingly on model classes/methods to explain
  non-obvious game-design intent (e.g. why a workaround exists), not to restate the obvious.
- Spec files sit next to their source (`*.spec.ts`), using Jasmine (`describe`/`it`/`expect`).

## Response Style

- Keep all responses concise.
