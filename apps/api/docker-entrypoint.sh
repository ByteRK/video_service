#!/bin/sh
set -eu
cd /app/apps/api
../../node_modules/.bin/tsx prisma/bootstrap.ts
../../node_modules/.bin/tsx prisma/seed.ts
exec node dist/main.js
