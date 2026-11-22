# Still — a minimal time instrument

[![License: MIT](https://img.shields.io/badge/License-MIT-white.svg)](./LICENSE)
[![Deployed on Vercel](https://img.shields.io/badge/Vercel-deployed-white.svg)](https://vercel.com)

A full-screen stopwatch, countdown, and date timer built as a quiet, cinematic interface.

## Getting started

```bash
git clone https://github.com/import-dhruv/stilltime.git
cd stilltime
npm install
npm run dev      # http://localhost:5173
```

Other scripts:

```bash
npm run typecheck
npm run build    # production output in dist/
npm run preview  # serve the production build
```

## Interaction

- **Click the timer** (or move the pointer near the bottom of the screen) to reveal controls.
- **Space** start / pause · **R** reset · **L** record lap · **Escape** hide controls.
- Mode selector, lap list, countdown setup, date target and preferences all live in the hidden dock.

## Features

- Timestamp-based timing (never drifts), driven by `requestAnimationFrame`.
- Per-digit rolling seconds animation with soft fade, blur, and vertical motion.
- Stopwatch with laps (lap time, cumulative time, best/worst highlighting) and clear.
- Countdown with custom duration, pause/resume/reset and a subtle completion pulse.
- Date countdown with optional title, persisted in `localStorage` across reloads.
- Optional Web Audio cues, reset confirmation, adjustable display size, light theme, and fullscreen.

## Stack

React · TypeScript · Vite · Tailwind CSS · Framer Motion · Lucide React

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for the commit convention and pull-request workflow, and [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) for community guidelines.

## License

[MIT](./LICENSE) © Dhruv
