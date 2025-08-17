Contributing Guidelines
=======================

1. Install dependencies
```
npm install
```

2. Run services (dev)
```
docker-compose up -d postgres redis elasticsearch rabbitmq
npm run dev:backend
npm run dev:frontend
```

3. Coding standards
- TypeScript for all new backend code
- Run `npm run lint` before committing
- Keep functions under ~50 lines where practical

4. Environment
- Add new required env vars with Zod validation in a `env.ts` (or inline schema)
- Document additions in `env.example` files

5. Testing
- Add or extend Jest tests in `__tests__` directories
- Prefer fast unit tests; integration tests may use dockerized deps later

6. Pull Requests
- Include summary of changes and rationale
- Reference related issue IDs
- Ensure no `console.log` debugging left (use `console.error` for errors)

Thank you for contributing!
