# Modern Node Alpine image — no legacy http_parser module
FROM node:20-alpine

WORKDIR /app

# Copy package files for layer caching
COPY package*.json ./

# Clean install (respects package-lock.json)
RUN npm ci

# Copy application source
COPY . .

# Expose Vite dev server port
EXPOSE 4100

# Start Vite dev server bound to all interfaces
CMD ["npm", "run", "dev"]