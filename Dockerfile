# Use official Node.js LTS image
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

# Fetch AWS RDS CA bundle at build time (public cert, not a secret)
RUN apk add --no-cache wget && \
    mkdir -p /app/certs && \
    wget -q https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem \
      -O /app/certs/global-bundle.pem

ENV RDS_CA_CERT_PATH=/app/certs/global-bundle.pem

# Copy only necessary files from builder
COPY --from=builder /app/package.json ./ 
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# Expose port (default 8080, can be overridden)
EXPOSE 8080

# Start the server
CMD ["node", "dist/index.js"]