# Use the latest Node.js LTS Alpine base image
FROM node:20-alpine AS base

# Set the working directory
WORKDIR /app

# Install OS dependencies if required (uncomment if you encounter compatibility issues)
RUN apk add --no-cache libc6-compat

# Stage 1: Install dependencies only when needed
FROM base AS deps

# Copy package manager lock files
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

# Install dependencies based on the available package manager lock file
RUN \
  if [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then npm install -g pnpm && pnpm install --frozen-lockfile; \
  else echo "No lockfile found, exiting." && exit 1; \
  fi

# Stage 2: Build the application
FROM base AS builder

# Copy dependencies and source code
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables
ENV NEXT_TELEMETRY_DISABLED 1

# Build the Next.js application
RUN yarn build

# Uncomment if using npm instead of yarn
# RUN npm run build

# Stage 3: Create production image with minimal files
FROM node:20-alpine AS runner

WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Add non-root user for security
RUN addgroup -S nextjs && adduser -S nextjs -G nextjs

# Copy necessary files for the production app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set ownership to the non-root user
RUN chown -R nextjs:nextjs ./

# Switch to the non-root user
USER nextjs

# Expose the port the app will run on
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
