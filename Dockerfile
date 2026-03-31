# Stage 1: Build the React application
FROM node:20-alpine as builder

WORKDIR /app

# Copy package.json and lock file to install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app source code
COPY . .

# Build the Vite application
RUN npm run build

# Stage 2: Serve the application with NGINX
FROM nginx:alpine

# Copy the built files from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom NGINX configuration (if we add one) or just use default
# Exposed port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
