FROM node:20-slim

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy root package files and workspace files
COPY package.json pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./

# Copy server package.json
COPY server/package.json ./server/

# Install dependencies (only for server if you prefer, but root install is easier for workspace)
RUN pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY server/ ./server/

# Set workdir to server for running the app
WORKDIR /app/server

# Expose the port the app runs on (update if your app uses a different port, e.g. 3000)
EXPOSE 3000

# Start the application
CMD ["node", "index.js"]

