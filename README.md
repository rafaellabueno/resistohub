# ResistoHub

ResistoHub is an open-source web platform for antimicrobial-resistance surveillance, bioinformatics, educational resources, protocols and collaboration. It was developed as part of a graduate research project and is provided so the implementation can be inspected and reproduced alongside the associated article.

## Stack

- Next.js 15.2.1 and React 18.2.0 for the web interface
- Hono 4.9.4 for the API
- Bun 1.3.10 as the JavaScript runtime used during development
- MySQL 8.0 for persistence
- Drizzle ORM 0.40.1 and Drizzle Kit 0.30.6 for database access and migrations
- Python 3.12 and Flask for the e-mail service
- Docker Compose for local orchestration

## Requirements

- Docker Engine and Docker Compose v2
- Bun 1.3.10, if running services outside Docker
- Git

## Local installation

```bash
git clone git@github.com:rafaellabueno/resistohub.git
cd mestrado
cp .env.example .env
cp hono/.env.example hono/.env
cp nextjs/.env.example nextjs/.env
```

Replace the `change-me` values in the environment files with local development values. Do not commit these files. Then start the development stack:

```bash
docker compose --env-file .env -f docker-compose.dev.yml up --build
```

The web interface is available at `http://localhost:4321`, the API at `http://localhost:3334` and the e-mail service at `http://localhost:6000`.

To stop the stack:

```bash
docker compose -f docker-compose.dev.yml down
```

## Database

The repository contains Drizzle schema migrations only. It does not contain a database dump or application data. The development Compose file creates an empty MySQL database; apply migrations with:

```bash
docker compose -f docker-compose.dev.yml exec hono bun run db:migrate
```

Never use production credentials or production data in a local checkout intended for publication.

## Repository layout

```text
nextjs/       Web interface
hono/         API, database schema and migrations
emails/       E-mail service
sharedItems/  Shared validation schemas
tutorial-assets/ Documentation images
```

## Security and privacy

Secrets belong in environment variables and are excluded by `.gitignore`. Before publishing a new fork, inspect the complete Git index for credentials, personal data, database exports and private assets. Credentials that appeared in an older private repository must be revoked even if the old history is not copied to the public repository.

## Dependency licenses

The direct dependencies are distributed under permissive licenses. The main packages include MIT-licensed Next.js, React, Hono and Drizzle Kit, and Apache-2.0-licensed Drizzle ORM. See [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md) for the audit scope and commands used to inspect package metadata. Transitive dependency licenses should be regenerated from the lockfiles before each release.

## Citation

If you use this software, cite the associated article. A machine-readable citation template is provided in [CITATION.cff](CITATION.cff).

## License

This project is released under the MIT License. See [LICENSE](LICENSE).