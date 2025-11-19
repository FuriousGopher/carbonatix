## Carbonatix BMS API

REST API for managing publishers and websites, built with NestJS, TypeORM, MySQL, and Redis-backed caching.

### Prerequisites
- Node.js 18+
- npm
- Docker + Docker Compose (for MySQL/Redis)

### Getting started (local dev)
1. **Install deps**
   ```bash
   npm install
   ```
2. **Configure environment**  
   `.env` already contains sane local defaults. Adjust ports or credentials if needed.
3. **Start infrastructure**
   ```bash
   npm run docker:up
   # mysql -> 3307, redis -> 6379
   ```
4. **Run the API**
   ```bash
   npm run start:dev
   ```
5. **Explore**  
   - Swagger docs: `http://localhost:3000/docs` (basic auth from `.env`)  
   - Health check: `GET /health`

### Full Docker stack
`docker compose up --build` spins up MySQL, Redis, and the API container (health checks hit `/health`). Once healthy:

- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/docs`

Stop everything with `docker compose down` (add `-v` to drop data volumes).

### Tests & build
```bash
npm run test     # unit tests (app, publisher, website)
npm run build    # compile to dist/
```

### Stopping / cleanup
```bash
npm run docker:down        # stop containers
docker compose down -v     # remove containers + data volumes (resets DB)
```