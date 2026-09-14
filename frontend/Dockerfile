# Pin an exact tag (never `latest`) so builds are reproducible.
FROM node:24-alpine AS base
WORKDIR /app

# ---- deps: install devDependencies too — needed to build and to run vite/vitest ----
FROM base AS deps
# Copy manifests before source so this layer is cached across source-only changes.
COPY package.json package-lock.json ./
RUN npm ci

# ---- build: deps + source, used for local dev with hot reload ----
FROM deps AS build
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

# ---- test: same as build, but the default command runs the test suite ----
FROM build AS test
CMD ["npm", "test"]

# ---- static-build: produce the production bundle (needs the devDependency `vite`) ----
FROM build AS static-build
RUN npm run build

# ---- runtime: a static file server only — a built SPA has zero npm deps at runtime ----
FROM node:24-alpine AS runtime
WORKDIR /app
RUN npm install -g serve@14.2.3
COPY --from=static-build /app/dist ./dist
# Run as non-root: `serve` only ever needs read access to ./dist.
RUN addgroup -S appgroup && adduser -S appuser -G appgroup && chown -R appuser:appgroup /app
USER appuser
EXPOSE 3000
# HEALTHCHECK proves the static server is actually responding, not just alive.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/ || exit 1
CMD ["serve", "-s", "dist", "-l", "3000"]
