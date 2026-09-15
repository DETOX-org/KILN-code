FROM node:18-bookworm

WORKDIR /judge

COPY services/judge/package*.json ./

RUN npm ci

COPY services/judge/dist/services/judge ./dist

EXPOSE 3001

CMD ["sh", "-c", "node dist/workers/server.js & node dist/queue/judge-worker.js"]