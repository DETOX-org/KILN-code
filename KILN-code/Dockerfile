FROM node:24

WORKDIR /app

COPY backend/package*.json ./backend/

WORKDIR /app/backend

RUN npm ci

COPY backend/ ./

WORKDIR /app/backend

CMD ["npm", "run", "dev"]