# Pin an exact tag (never `latest`) so builds are reproducible.
FROM python:3.12-slim AS base
WORKDIR /app
# Keep pip from writing .pyc cache noise and buffer-free logs for `docker logs`.
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1

# ---- deps: install everything needed to run AND test/lint (dev + prod deps) ----
FROM base AS deps
COPY requirements.txt requirements-dev.txt ./
# --no-cache-dir keeps the layer (and final image) smaller.
RUN pip install --no-cache-dir -r requirements-dev.txt

# ---- build: deps + source, used for local dev with --reload and hot mounts ----
FROM deps AS build
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# ---- test: same as build, but the default command runs the test suite ----
FROM build AS test
CMD ["pytest", "-q"]

# ---- runtime: production-only deps (no pytest/ruff), non-root, minimal image ----
FROM base AS runtime
# Runtime stage installs production dependencies only — smaller image, smaller
# attack surface (no test/lint tooling shipped to production).
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY main.py models.py errors.py repositories.py seed.py ./
COPY services/ ./services/
# Run as non-root: if the process is ever compromised, it can't write outside
# its own files or bind privileged ports.
RUN useradd --create-home --uid 1000 appuser && chown -R appuser:appuser /app
USER appuser
EXPOSE 8000
# HEALTHCHECK proves the app itself is serving requests, not just that the
# process is alive — a hung event loop still shows as a "running" process.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/health', timeout=2)" || exit 1
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
