# Stage 1: Build the React application
FROM node:20-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev for build)
RUN npm ci

# Copy source code
COPY . .

# Build the React app
RUN npm run build

# Stage 2: Production server
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built React app
COPY --from=build /app/dist ./dist

# Copy server files
COPY server ./server

# Expose port 8080 (Cloud Run default)
ENV PORT=8080
EXPOSE 8080

# Start the Express server
CMD ["node", "server/server.js"]
