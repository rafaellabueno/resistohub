# Third-party notices

This project uses dependencies from the npm, Bun and Python ecosystems. Their dependency graphs are recorded in the lockfiles and requirements file:

- `nextjs/package-lock.json`
- `nextjs/bun.lock`
- `hono/bun.lock`
- `emails/requirements.txt`

The main direct packages were checked from installed package metadata:

| Package | Version used | License |
| --- | ---: | --- |
| Next.js | 15.2.1 resolved | MIT |
| React | 18.2.0 | MIT |
| Hono | 4.9.4 resolved | MIT |
| Drizzle ORM | 0.40.1 resolved | Apache-2.0 |
| Drizzle Kit | 0.30.6 resolved | MIT |

Before a release, regenerate a complete report from a clean install and review every transitive package license. For JavaScript packages, inspect each `package.json` in the installed dependency tree. For Python packages, inspect the metadata installed from `emails/requirements.txt`.

The project source and its original assets may have separate copyright or consent requirements. Do not redistribute personal images, user records, production uploads or database exports without documented permission.