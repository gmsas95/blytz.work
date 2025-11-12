# AGENTS.md

**IMPORTANT: Read README.md first for full project context, PRD, and detailed specifications.**

## Build Commands
- Backend: `npm run dev` (development), `npm run generate` (Prisma client), `npm run migrate` (database migrations)
- Frontend: Not yet implemented (Next.js 15 with App Router planned)
- Tests: No test framework configured yet

## Code Style Guidelines

### TypeScript/JavaScript
- Use ES modules (`"type": "module"` in package.json)
- TypeScript strict mode enabled
- Use `.js` extensions for imports (required for ES modules)

### Backend (Fastify)
- Route structure: `src/routes/[feature].ts` (health.ts, va.ts, company.ts)
- Plugins: `src/plugins/[feature].ts` (firebaseAuth.ts)
- Utilities: `src/utils/[feature].ts` (prisma.ts)
- Use async/await consistently
- Export route functions as default: `export default async function featureRoutes(app)`
- Server entry: `src/server.ts`

### Database (Prisma)
- Schema in `prisma/schema.prisma`
- Models: User, VAProfile, Company, JobPosting, MatchVote
- Use `@default(cuid())` for primary keys
- Boolean fields default to `true` where appropriate (availability)
- Use `@@unique` constraints for composite keys ([jobPostingId, vaProfileId])

### Authentication
- Firebase Auth with JWT verification
- Auth middleware in `src/plugins/firebaseAuth.ts`
- Add user to request object: `request.user = decoded`
- User roles: "company" | "va"

### Business Logic
- VA profiles: name, country, hourlyRate, skills[], availability
- Company job postings: title, description, rateRange
- Matching: Manual swipe interface, mutual like required
- MatchVote model tracks votes from both company and VA

### Naming Conventions
- Files: kebab-case for routes/plugins, camelCase for utilities
- Variables/Functions: camelCase
- Database models: PascalCase
- API endpoints: kebab-case

### Error Handling
- Use Fastify reply codes: `reply.code(401).send({ error: "message" })`
- Always validate authorization headers
- Use try/catch for async operations

### Project Structure
```
va-matching-app/
├─ backend/
│  ├─ src/
│  │  ├─ server.ts
│  │  ├─ plugins/
│  │  ├─ routes/
│  │  └─ utils/
│  ├─ prisma/
│  └─ package.json
└─ frontend/ (empty for now)
```