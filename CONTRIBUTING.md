# Contributing

Thanks for helping improve Still. This project is intentionally small: please keep changes focused, minimal, and in service of the interface.

## Getting started

```bash
git clone https://github.com/import-dhruv/stilltime.git
cd stilltime
npm install
npm run dev
```

Before opening a pull request:

```bash
npm run typecheck
npm run build
```

## Workflow

1. Fork the repository (or create a branch if you have write access).
2. Create a topic branch from `main`: `feat/seconds-roll`, `fix/lap-timing`, `docs/setup-notes`.
3. Make **one logical change per commit**. Do not mix formatting, features, and refactors.
4. Keep commits small enough to review in isolation.
5. Open a pull request against `main` describing the problem, the change, and how you verified it.

## Commit messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(timer): add keyboard lap recording
fix(countdown): clamp remaining time to zero
docs: document deployment steps
chore: bump Vite to v6
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`.
Use an optional scope in parentheses, an imperative subject in lower case, and no trailing period.

## Design guidelines

- Pure black default, monochrome palette, generous negative space.
- The timer is the hero; controls stay hidden until needed.
- Prefer timestamp-based calculations over incrementing counters.
- Clean up intervals, animation frames, and event listeners in effects.
- Add no dependencies unless the feature cannot be done cleanly without one.

## Code style

- TypeScript strict mode, no unused locals or parameters.
- Functional components with small, reusable hooks and components.
- Keep `src/hooks` for state logic and `src/components` for presentation.

## Reporting bugs

Open an issue with the expected behaviour, actual behaviour, steps to reproduce, browser/OS, and a screenshot if the problem is visual.

By contributing you agree that your contributions will be licensed under the [MIT License](./LICENSE).
