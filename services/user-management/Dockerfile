FROM node:22-trixie-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev --omit=optional

COPY shared ./shared
COPY services/user-management ./services/user-management

ENV NODE_ENV=production
ENV PORT=3000
ENV SQLITE_PATH=/data/user-management.sqlite

EXPOSE 3000

CMD ["node", "services/user-management/server.js"]
