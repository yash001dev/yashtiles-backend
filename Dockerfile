# Use official Node.js LTS image
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY .env.production .env

RUN npm ci --omit=dev

# Set environment variable for production by default
ENV NODE_ENV=production

#Expose the port the app runs on
EXPOSE 3000

CMD ["node", "dist/main.js"]
