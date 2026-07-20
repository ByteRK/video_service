FROM node:22-alpine AS build
WORKDIR /app
COPY package.json yarn.lock ./
COPY .yarnrc ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN corepack enable && yarn install --frozen-lockfile
COPY apps/web apps/web
RUN yarn workspace @video/web build
FROM nginx:1.27-alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
