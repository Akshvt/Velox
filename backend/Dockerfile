FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies including dev dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Since it's a Node app without a build step (ESM), we don't strictly need a builder, 
# but we can prune dev dependencies for the final image.
RUN npm prune --production

FROM node:20-alpine AS production

WORKDIR /app

# Run as non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001 -G nodejs

# Copy only production dependencies and source code
COPY --from=builder --chown=nodeuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodeuser:nodejs /app/src ./src
COPY --from=builder --chown=nodeuser:nodejs /app/package.json ./package.json

USER nodeuser

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["npm", "start"]
