# Build stage
FROM node:20-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the frontend
RUN npm run build:frontend

# Build the server
RUN npm run build:server

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm install --production

# Copy built files from build stage
COPY --from=build /app/dist ./dist

# Expose the port the app runs on
EXPOSE 3001

# Start the application
CMD ["npm", "start"] 