# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9

# Copy package files and workspace config
COPY package*.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
RUN pnpm install

# Copy the rest of the app and build
COPY . .
RUN pnpm run build

EXPOSE 3000

CMD ["pnpm", "start"]