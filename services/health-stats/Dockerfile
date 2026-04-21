FROM node:22-trixie-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev --omit=optional

COPY shared ./shared
COPY services/health-stats ./services/health-stats

ENV NODE_ENV=production
ENV PORT=3000
ENV SQLITE_PATH=/data/health-stats.sqlite

EXPOSE 3000

CMD ["node", "services/health-stats/server.js"]
