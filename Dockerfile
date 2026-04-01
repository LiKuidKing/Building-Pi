# Stage 1: Build the React application
FROM node:20-alpine as builder

WORKDIR /app

# Copy package info and install frontend/backend dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Build the Vite application into static files under /dist
RUN npm run build

# Stage 2: Serve the application with Node.js
FROM node:20-alpine

WORKDIR /app

# Copy package.json to install solely production backend dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy the built React app
COPY --from=builder /app/dist ./dist

# Copy the Node.js backend server code
COPY --from=builder /app/backend ./backend

# Set the node environment to production so Server.js knows to serve dist/ on Port 80
ENV NODE_ENV=production
ENV PORT=80

EXPOSE 80
EXPOSE 47808/udp

# Start the Node.js Express server
CMD ["node", "backend/server.js"]
