FROM node:18-bookworm AS builder

WORKDIR /repo

COPY services/judge/package*.json ./services/judge/
RUN cd services/judge && npm ci

COPY shared ./shared
COPY services/judge ./services/judge

RUN cd services/judge && npx tsc

FROM node:18-bookworm

WORKDIR /judge

COPY services/judge/package*.json ./

RUN npm ci

COPY --from=builder /repo/services/judge/dist/services/judge ./dist
COPY --from=builder /repo/services/judge/dist/shared /shared
COPY services/judge/runtimes ./dist/runtimes

EXPOSE 3001
EXPOSE 3002
EXPOSE 9999

CMD ["sh", "-c", "node dist/workers/server.js & node dist/queue/judge-worker.js & node dist/dmoj/dmoj-adapter-server.js & wait"]