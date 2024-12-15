FROM node:23.4-alpine3.21 AS builder
WORKDIR /app

COPY ["package.json", "package-lock.json", "./"]
RUN npm cache clean --force

RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

FROM nginx:1.26.2-alpine3.20-slim AS production
ENV NODE_ENV=production


COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80
