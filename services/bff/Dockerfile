FROM node:22-trixie-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev --omit=optional

COPY shared ./shared
COPY services/bff ./services/bff

ENV NODE_ENV=production
ENV PORT=3000
ENV SQLITE_PATH=/data/bff.sqlite
ENV USER_SERVICE_URL=http://user-management:3000
ENV HEALTH_STATS_SERVICE_URL=http://health-stats:3000

EXPOSE 3000

CMD ["node", "services/bff/server.js"]
