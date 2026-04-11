# Build stage
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_API_URL=/api
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN npm run build

# Run stage: nginx on 3110, proxy / to Next.js and /api to backend (algo-style, no separate nginx service)
FROM nginx:alpine
RUN apk add --no-cache nodejs

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Next.js standalone app (run on 3000 inside container)
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Nginx: listen 3110, proxy / to Next.js and /api, /swagger to backend (see nginx/default.conf)
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 3110

CMD ["sh", "-c", "node /app/server.js & sleep 2 && exec nginx -g 'daemon off;'"]