FROM node:18-bookworm

WORKDIR /judge

COPY services/judge/package*.json ./

RUN npm ci

COPY services/judge/dist/services/judge ./dist
COPY services/judge/dist/shared /shared
COPY services/judge/runtimes ./dist/runtimes

EXPOSE 3001
EXPOSE 3002
EXPOSE 9999

CMD ["sh", "-c", "node dist/workers/server.js & node dist/queue/judge-worker.js & node dist/dmoj/dmoj-adapter-server.js & wait"]
