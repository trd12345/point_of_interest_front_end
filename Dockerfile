# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Final stage
FROM node:20-alpine

WORKDIR /app

# Copy package files and production dependencies
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
# Copy built application from build stage
COPY --from=builder /app/build ./build

# Expose the frontend port
EXPOSE 5173

# Start the application
ENV PORT=5173
CMD ["node", "build"]
