# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Node.js/Express skeleton for a user management REST API test. The goal is to implement a full CRUD API with JWT authentication and an in-memory user repository.

## Commands

```bash
yarn dev       # Start dev server with tsx watch + inspector on port 7000
yarn build     # Compile TypeScript to dist/
yarn start     # Run compiled output from dist/
```

No test runner or linter is configured.

## Architecture

- `src/index.ts` — Express app entry point: sets up CORS, loads routes, listens on `PORT` (default 3000)
- `src/routes.ts` — All route definitions
- `src/repository.ts` — In-memory user store
- `src/middleware/auth.ts` — JWT auth middleware
- `src/types.ts` — Shared interfaces (`User`, `JwtPayload`) and Express `Request` augmentation
- `tsconfig.json` — TypeScript config (`target: ES2022`, `outDir: dist`)
- `.env` — Environment variables (`PORT=3000`)

## Requirements to Implement (from README)

- **Auth route:** `POST /auth` — returns a JWT token given valid credentials
- **User routes (all require JWT auth):**
  - `POST /users` — create user (block duplicate emails)
  - `GET /users` — list users
  - `PUT /users/:id` — update user
  - `DELETE /users/:id` — delete user
- **In-memory user repository** (no database)
- **Pre-seeded admin user:**
  - name: `"admin"`, email: `"admin@spsgroup.com.br"`, type: `"admin"`, password: `"1234"`
- **User fields:** `email`, `name`, `type`, `password`
