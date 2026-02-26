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
├── Dockerfile      # Production image for web + cms
├── docker-compose.yml
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
# Run frontend + Strapi in development mode
pnpm dev

# Run frontend only
pnpm --filter @grawlix/web dev

# Run CMS only
pnpm --filter @grawlix/cms dev
```

- Frontend: http://localhost:3000
- Strapi API: http://localhost:1337
- Strapi Admin: http://localhost:1337/admin

### Building

```bash
pnpm build
```

### Production (Local)

```bash
pnpm build
pnpm start
```

### Linting & Formatting

```bash
# Check lint and formatting
pnpm exec biome check .

# Auto-fix
pnpm exec biome check --write .
```

## Environment Variables (CMS)

Copy the CMS example file and set strong secrets before production use:

```bash
cp apps/cms/.env.example apps/cms/.env
```

Required variables are in `apps/cms/.env.example`:
- `APP_KEYS`
- `API_TOKEN_SALT`
- `ADMIN_JWT_SECRET`
- `TRANSFER_TOKEN_SALT`
- `JWT_SECRET`
- `DATABASE_FILENAME`

`pnpm dev` works without a `.env` file by using development fallback values, but production should always set explicit secure values.

## Docker

Build and run both frontend and Strapi in one container:

```bash
docker compose up --build
```

Exposed ports:
- `3000` frontend
- `1337` Strapi API/Admin

## DevContainer

This project includes a VS Code Dev Container configuration for a consistent development environment. Open the project in VS Code and select "Reopen in Container" when prompted.

## CI/CD

GitHub Actions runs on every PR to `main` and `dev` branches:
- **Lint**: Biome linter checks
- **Format**: Biome format checks
- **Typecheck**: TypeScript type checks
