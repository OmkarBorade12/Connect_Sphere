FROM node:18-alpine

WORKDIR /app

# Install dependencies (only what's needed for server including frontend dist)
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install Server Deps
WORKDIR /app/server
RUN npm install

# Build Client
WORKDIR /app/client
RUN npm install
COPY client/ ./
RUN npm run build

# Setup Server
WORKDIR /app/server
COPY server/ ./

# Expose Port
EXPOSE 3001

# Start
CMD ["node", "index.js"]
