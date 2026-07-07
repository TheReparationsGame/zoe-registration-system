# Build stage for frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/src ./src
COPY frontend/public ./public
RUN npm run build

# Backend stage
FROM node:18-alpine
WORKDIR /app

# Copy backend
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --production

# Copy built frontend to backend public folder
RUN mkdir -p public
COPY --from=frontend-build /app/frontend/build ./public

# Copy backend code
COPY backend/server.js ./

EXPOSE 5000
ENV NODE_ENV=production

CMD ["node", "server.js"]
