FROM node:20-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY database ./database
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install --omit=dev
COPY backend/src ./src
COPY --from=frontend /app/frontend/dist /app/frontend/dist
EXPOSE 10000
CMD ["node", "src/server.js"]
