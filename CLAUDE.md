# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Node.js/Express skeleton for a user management REST API test. The goal is to implement a full CRUD API with JWT authentication and an in-memory user repository.

## Commands

```bash
yarn dev       # Start dev server with nodemon + inspector on port 7000
```

No test runner or linter is configured.

## Architecture

- `src/index.js` — Express app entry point: sets up CORS, loads routes, listens on `PORT` (default 3000)
- `src/routes.js` — All route definitions (currently a stub with only `GET /`)
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
