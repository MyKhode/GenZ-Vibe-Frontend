# Multi-stage Dockerfile for Nuxt 4 (Nitro node-server)

FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies first (better cache)
COPY package*.json ./
# If using pnpm/yarn, copy lockfiles as needed
COPY pnpm-lock.yaml ./
RUN npm ci --no-audit --no-fund || npm install --no-audit --no-fund

# Copy the rest of the source
COPY . .

# Build the project
RUN npm run build


FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=9192
ENV NITRO_PORT=9192

# Copy only the built output
COPY --from=builder /app/.output ./.output

EXPOSE 9192

CMD ["node", ".output/server/index.mjs"]

