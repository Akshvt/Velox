FROM node:20-alpine AS builder

WORKDIR /app

# Copy package info
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the Vite app
RUN npm run build

# Use NGINX for serving static files
FROM nginx:alpine

# Run as non-root user for security (nginx standard practice)
# We will use the default nginx configuration but replace the default html
# Nginx needs to be configured correctly via the root docker-compose for the backend proxy

# Copy built files from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
