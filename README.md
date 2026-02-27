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
# Generate root .env from .env.example (one-time setup)
pnpm env:generate

# Run frontend + Strapi in development mode
# (automatically symlinks root .env into each app before starting)
pnpm dev

# Run frontend only
pnpm --filter @grawlix/web dev

# Run CMS only
pnpm --filter @grawlix/cms dev
```

- Frontend: http://localhost:3000
- Strapi API: http://localhost:1337
- Strapi Admin: http://localhost:1337/admin

> **Note:** `pnpm dev` (and `pnpm build`) automatically run the env link step
> via a `predev`/`prebuild` hook. You can also run it manually at any time:
>
> ```bash
> pnpm env:link
> ```
>
> This creates `apps/cms/.env → ../../.env` and `apps/web/.env → ../../.env`
> so each app picks up the shared root `.env` through its native env loading.

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

## Environment Variables

Both apps share a single root `.env` file. The `env:link` step (run automatically
before `dev` and `build`) creates symlinks so Astro and Strapi each load it natively.

### Quick start

```bash
# Option A — generate fresh secrets automatically
pnpm env:generate

# Option B — fill in your own values
cp .env.example .env
```

`pnpm env:generate` will refuse to overwrite an existing `.env` — delete it first if you need to regenerate secrets.

Then optionally verify the symlinks are in place:

```bash
pnpm env:link
```

Common variables (see `.env.example` for the full list):
- `PUBLIC_CMS_URL`: Strapi base URL used by the frontend contact form  
  (embedded in the Astro static build at compile time)
- `APP_KEYS`
- `API_TOKEN_SALT`
- `ADMIN_JWT_SECRET`
- `TRANSFER_TOKEN_SALT`
- `JWT_SECRET`
- `DATABASE_FILENAME`

Strapi startup fails fast if required variables are missing or left with placeholder values.
This applies to `dev`, `build`, and `start` commands for the CMS package.

## Docker

Build and run both frontend and Strapi in one container:

```bash
# Set env values first
cp .env.example .env

docker compose up --build
```

`docker-compose.yml` loads values from root `.env` at runtime via `env_file`.
The link step is skipped automatically in Docker builds (no `.env` is present in
the image — env vars are injected directly by Docker/the platform).

For the Astro static build, `PUBLIC_CMS_URL` is embedded at compile time.
Pass it as a Docker build argument when the Strapi URL is known at image build time:

```bash
docker build --build-arg PUBLIC_CMS_URL=https://api.example.com:1337 .
```

On DigitalOcean App Platform, set it as a build-time environment variable in the
app spec or dashboard.

Exposed ports:
- `80` → frontend (Astro, internal port 3000)
- `1337` → Strapi API / Admin

## DevContainer

This project includes a VS Code Dev Container configuration for a consistent development environment. Open the project in VS Code and select "Reopen in Container" when prompted.

## CI/CD

GitHub Actions runs on every PR to `main` and `dev` branches:
- **Lint**: Biome linter checks
- **Format**: Biome format checks
- **Typecheck**: TypeScript type checks
