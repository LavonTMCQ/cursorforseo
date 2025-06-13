# Use Node.js 18 with Playwright dependencies
FROM mcr.microsoft.com/playwright:v1.40.0-focal

# Set working directory
WORKDIR /app

# Copy package files and Prisma schema first
COPY package*.json ./
COPY pnpm-lock.yaml ./
COPY prisma ./prisma/

# Install pnpm
RUN npm install -g pnpm

# Install dependencies (this will run postinstall and generate Prisma client)
RUN pnpm install --frozen-lockfile

# Copy rest of source code
COPY . .

# Generate Prisma client (ensure it's generated with full source)
RUN pnpm prisma generate

# Install Playwright browsers
RUN pnpm exec playwright install chromium

# Build the application
RUN pnpm build

# Deploy database schema (if DATABASE_URL is available)
RUN if [ -n "$DATABASE_URL" ]; then pnpm db:push; fi

# Expose the WebSocket port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start the WebSocket server
CMD ["pnpm", "run", "websocket"]
