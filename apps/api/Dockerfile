FROM node:22-alpine AS build
WORKDIR /app
COPY package.json yarn.lock ./
COPY .yarnrc ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN corepack enable && yarn install --frozen-lockfile
COPY apps/api apps/api
RUN yarn workspace @video/api db:generate && yarn workspace @video/api build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/prisma ./apps/api/prisma
COPY apps/api/docker-entrypoint.sh ./apps/api/docker-entrypoint.sh
RUN chmod +x ./apps/api/docker-entrypoint.sh
EXPOSE 3000
ENTRYPOINT ["./apps/api/docker-entrypoint.sh"]
