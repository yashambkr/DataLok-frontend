# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9

# Copy package files and workspace config
COPY package*.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
RUN pnpm install

# Copy the rest of the app
COPY . .

# Set build-time environment variables for Next.js public bundles
ARG NEXT_PUBLIC_API_BASE_URL=https://datalok-backend-production.up.railway.app/api
ARG NEXT_PUBLIC_BASE_URL=https://datalok-frontend-production.up.railway.app
ARG NEXTAUTH_URL=https://datalok-frontend-production.up.railway.app
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL
ENV NEXTAUTH_URL=$NEXTAUTH_URL

RUN pnpm run build

EXPOSE 3000

CMD ["pnpm", "start"]