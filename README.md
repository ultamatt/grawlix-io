# grawlix-io

Official website and CMS for [Grawlix](https://grawlix.io) — a web and mobile application development company.

## Tech Stack

- **Frontend**: [Astro](https://astro.build) + [React](https://react.dev)
- **CMS**: [Strapi](https://strapi.io)
- **Package Manager**: [pnpm](https://pnpm.io)
- **Build System**: [Turbo](https://turbo.build)
- **Linting/Formatting**: [Biome](https://biomejs.dev)

## Project Structure

```
grawlix-io/
├── apps/
│   ├── web/        # Astro + React frontend (port 3000)
│   └── cms/        # Strapi CMS backend (port 1337)
├── .devcontainer/  # VS Code Dev Container config
├── .github/        # GitHub Actions CI workflows
├── biome.json      # Biome linting/formatting config
├── turbo.json      # Turbo build config
└── pnpm-workspace.yaml
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) >= 18
- [pnpm](https://pnpm.io) >= 9

### Installation

```bash
# Install pnpm if not already installed
npm install -g pnpm

# Install dependencies
pnpm install
```

### Development

```bash
# Run all apps in development mode
pnpm dev

# Run frontend only
pnpm --filter @grawlix/web dev

# Run CMS only
pnpm --filter @grawlix/cms develop
```

### Building

```bash
pnpm build
```

### Linting & Formatting

```bash
# Check lint and formatting
pnpm exec biome check .

# Auto-fix
pnpm exec biome check --write .
```

## Environment Variables

Copy `.env.example` to `.env` in each app directory:

```bash
cp apps/cms/.env.example apps/cms/.env
```

## DevContainer

This project includes a VS Code Dev Container configuration for a consistent development environment. Open the project in VS Code and select "Reopen in Container" when prompted.

## CI/CD

GitHub Actions runs on every PR to `main` and `dev` branches:
- **Lint**: Biome linter checks
- **Format**: Biome format checks
- **Typecheck**: TypeScript type checks